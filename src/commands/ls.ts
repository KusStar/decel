
import { Table, colors, Spinner } from '../deps.ts'
import { APIS, formatDate, HEADERS } from '../utils.ts';
import { DataItem } from '../types/data.ts'
import { flags } from '../flags.ts'

const getDeployment = (item: DataItem, prod = false) => {
  const domainIdx = prod ? 1 : 0
  return item.hasProductionDeployment ? 'https://' + item.productionDeployment?.domainMappings[domainIdx].domain : 'null'
}

type Schema = {
  header: string
  body: (item: DataItem) => string
}[]

export const ls = async () => {
  const spin = Spinner('Fetching data...').start()
  const res = await fetch(APIS.INDEX_DATA, {
    headers: HEADERS
  })
  const data: DataItem[] = await res.json()
  spin.stop()


  const tableSchema: Schema = [
    {
      header: 'name',
      body: (item: DataItem) => item.name,
    },
    {
      header: 'prod',
      body: (item: DataItem) => getDeployment(item, true),
    },
    flags.showDev && {
      header: 'dev',
      body: (item: DataItem) => getDeployment(item),
    },
    {
      header: 'updatedAt',
      body: (item: DataItem) => formatDate(item.updatedAt),
    },
    {
      header: 'createdAt',
      body: (item: DataItem) => formatDate(item.createdAt),
    }
  ]
    .filter(it => !!it) as Schema

  new Table()
    .header(tableSchema
      .map(row => row.header)
      .map(col => colors.gray.bold(col))
    )
    .body(
      data
        .map((item) =>
          tableSchema
            .map(({ body }) => body)
            .map(body => body(item))
        )
        .map((col, i) => {
          if (i % 2 === 0) {
            return col.map(str => colors.underline(str))
          }
          return col
        })
    )
    .padding(1)
    .indent(2)
    .border(true)
    .render()
}