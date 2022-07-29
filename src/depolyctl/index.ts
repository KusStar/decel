import { fromFileUrl, Spinner, wait } from 'https://deno.land/x/deploy@1.3.0/deps.ts'
import { API, APIError } from 'https://deno.land/x/deploy@1.3.0/src/utils/api.ts'
import { error } from 'https://deno.land/x/deploy@1.3.0/src/error.ts'
import { walk } from 'https://deno.land/x/deploy@1.3.0/src/utils/walk.ts'
import { ManifestEntry } from 'https://deno.land/x/deploy@1.3.0/src/utils/api_types.ts'
import { parseEntrypoint } from 'https://deno.land/x/deploy@1.3.0/src/utils/entrypoint.ts'

export { error, parseEntrypoint }

interface DeployOpts {
  entrypoint: URL;
  importMapUrl: URL | null;
  static: boolean;
  prod: boolean;
  exclude?: string[];
  include?: string[];
  token: string;
  project: string;
  dryRun: boolean;
}

export async function deploy(opts: DeployOpts): Promise<void> {
  if (opts.dryRun) {
    wait("").start().info("Performing dry run of deployment");
  }
  const projectSpinner = wait("Fetching project information...").start();
  const api = API.fromToken(opts.token);
  const project = await api.getProject(opts.project);
  if (project === null) {
    projectSpinner.fail("Project not found.");
    Deno.exit(1);
  }
  projectSpinner.succeed(`Project: ${project.name}`);

  let url = opts.entrypoint;
  const cwd = Deno.cwd();
  if (url.protocol === "file:") {
    const path = fromFileUrl(url);
    if (!path.startsWith(cwd)) {
      error("Entrypoint must be in the current working directory.");
    }
    const entrypoint = path.slice(cwd.length);
    url = new URL(`file:///src${entrypoint}`);
  }
  let importMapUrl = opts.importMapUrl;
  if (importMapUrl && importMapUrl.protocol === "file:") {
    const path = fromFileUrl(importMapUrl);
    if (!path.startsWith(cwd)) {
      error("Import map must be in the current working directory.");
    }
    const entrypoint = path.slice(cwd.length);
    importMapUrl = new URL(`file:///src${entrypoint}`);
  }

  let uploadSpinner: Spinner | null = null;
  const files = [];
  let manifest: { entries: Record<string, ManifestEntry> } | undefined =
    undefined;

  if (opts.static) {
    wait("").start().info(`Uploading all files from the current dir (${cwd})`);
    const assetSpinner = wait("Finding static assets...").start();
    const assets = new Map<string, string>();
    const entries = await walk(cwd, cwd, assets, {
      include: opts.include,
      exclude: opts.exclude,
    });
    assetSpinner.succeed(
      `Found ${assets.size} asset${assets.size === 1 ? "" : "s"}.`,
    );

    uploadSpinner = wait("Determining assets to upload...").start();
    const neededHashes = await api.projectNegotiateAssets(project.id, {
      entries,
    });

    for (const hash of neededHashes) {
      const path = assets.get(hash);
      if (path === undefined) {
        error(`Asset ${hash} not found.`);
      }
      const data = await Deno.readFile(path);
      files.push(data);
    }
    if (files.length === 0) {
      uploadSpinner.succeed("No new assets to upload.");
      uploadSpinner = null;
    } else {
      uploadSpinner.text = `${files.length} new asset${files.length === 1 ? "" : "s"
        } to upload.`;
    }

    manifest = { entries };
  }

  if (opts.dryRun) {
    uploadSpinner?.succeed(uploadSpinner?.text);
    return;
  }

  let deploySpinner: Spinner | null = null;
  const req = {
    url: url.href,
    importMapUrl: importMapUrl ? importMapUrl.href : null,
    production: opts.prod,
    manifest,
  };
  const progress = api.pushDeploy(project.id, req, files);
  try {
    for await (const event of progress) {
      switch (event.type) {
        case "staticFile": {
          const percentage = (event.currentBytes / event.totalBytes) * 100;
          uploadSpinner!.text = `Uploading ${files.length} asset${files.length === 1 ? "" : "s"
            }... (${percentage.toFixed(1)}%)`;
          break;
        }
        case "load": {
          if (uploadSpinner) {
            uploadSpinner.succeed(
              `Uploaded ${files.length} new asset${files.length === 1 ? "" : "s"
              }.`,
            );
            uploadSpinner = null;
          }
          if (deploySpinner === null) {
            deploySpinner = wait("Deploying...").start();
          }
          const progress = event.seen / event.total * 100;
          deploySpinner.text = `Deploying... (${progress.toFixed(1)}%)`;
          break;
        }
        case "uploadComplete":
          deploySpinner!.text = `Finishing deployment...`;
          break;
        case "success":
          deploySpinner!.succeed(`Deployment complete.`);
          console.log("\nView at:");
          for (const { domain } of event.domainMappings) {
            console.log(` - https://${domain}`);
          }
          break;
        case "error":
          if (uploadSpinner) {
            uploadSpinner.fail(`Upload failed.`);
            uploadSpinner = null;
          }
          if (deploySpinner) {
            deploySpinner.fail(`Deployment failed.`);
            deploySpinner = null;
          }
          error(event.ctx);
      }
    }
  } catch (err: unknown) {
    if (err instanceof APIError) {
      if (uploadSpinner) {
        uploadSpinner.fail(`Upload failed.`);
        uploadSpinner = null;
      }
      if (deploySpinner) {
        deploySpinner.fail(`Deployment failed.`);
        deploySpinner = null;
      }
      error(err.toString());
    }
    error(String(err));
  }
}
