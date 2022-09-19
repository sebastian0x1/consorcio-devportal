import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Header, Search, Grid, Menu } from 'semantic-ui-react'
import _ from 'lodash'

import searchTermRegexp from '../../utils/search-term-regexp'
import './ApiSearch.css'


function prepareSearch(searchString) {
  return Array.from(new Set(searchString.toLowerCase().match(searchTermRegexp)))
}

function makeSearchList(data) {
  let result = []
  let stage

  if (data) {
    data.map((bs) => {
      return bs.business_line_stages.map((s) => {
        stage = s
        return s.stage_apis.map((api) => {
          const api_data = { //`/apis/${business_line}/${value.api_apiid}/${tableMeta.rowData[0]}`
            url: `/apis/${bs.business_line_name}/${api.api_apiid}/${api.api_tag_name}/${stage.stage_name}?ext=${api.api_is_external}`,
            title: stage.stage_name ? `${api.api_name} - ${stage.stage_name} (${bs.business_line_name})` : `${api.api_name}`,
            searchable: prepareSearch(`${api.api_name} ${stage.stage_name || ''}`).join(' '),
          }
          if (stage.stage_name) api_data.stage = stage.stage_name

          result.push(api_data)
          return api
        })
      })
    })
  }

  return result
}


export default function ApiSearch({
  apiList,
}) {
  const [value, setValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const updateSearch = useMemo(() => _.debounce(setSearchQuery, 100, { leading: true }), [])
  const dataSet = useMemo(() => makeSearchList(apiList.business_lines), [apiList]) // eslint-disable-line react-hooks/exhaustive-deps
  const results = useMemo(() => {
    if (!searchQuery) return []
    const prepared = prepareSearch(searchQuery)
    if (!prepared.length) return prepared
    return dataSet.filter((result) => prepared.every((term) => result.searchable.includes(term)))
  }, [searchQuery, dataSet])

  function handleSearchChange(e, { value }) {
    setValue(value)
    updateSearch(value)
  }

  return (
    <>
      <Grid style={{ padding: '1em' }}>
        <Grid.Column id="api-search">
          <Header as="h2" icon textAlign="center" style={{ padding: '40px 0px' }}>
            Buscador de APIs
          </Header>

          <Search
            placeholder="Buscar APIs por nombre o ambiente..."
            onSearchChange={handleSearchChange}
            results={results}
            resultRenderer={(result) => (
              <Menu.Item as={Link} to={result.url} style={{ display: 'inline-block', width: '100%', height: '100%' }}>
                {result.title}
              </Menu.Item>
            )}
            value={value}
          />
        </Grid.Column>
      </Grid>
    </>
  )
}