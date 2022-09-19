import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Label, Button, List } from 'semantic-ui-react'
import { v4 as uuidv4 } from 'uuid'
import { Typography } from '@material-ui/core'

import StageTable from './StageTable';


export default function ApisMenuTable({
    business_line,
    data,
}) {
    const [tableData, setTableData] = useState([])
    const navigate = useNavigate()

    useEffect( () => tableContent(), [data, business_line])

    const tableContent = () => {
        if(data.length < 1) return []
        let content_ = []

        data.business_lines
            .filter( bs => (bs.business_line_name.trimEnd() === business_line))
            .map( bs => {
                // console.log('bs => ', bs)
                return bs.business_line_stages.map((stage) => {
                    return stage.stage_apis.map((api) => {
                        return content_.push({
                            stage_name: stage.stage_name,
                            stage_color: stage.stage_color,
                            api_name: api.api_name,
                            api_color: api.api_color,
                            api_is_external: api.api_is_external,
                            swagger_data: api,
                            api_tag_accounts: {
                                api_tag_account_name: api.api_tag_name,
                                api_tag_account_color: api.api_tag_account_color,
                                api_tag_account: api.api_tag_account
                            },
                        })
                    })
                })
            }
        )
        setTableData(content_)
    }

    const tableColumns = () => {
        return [
            {
                name: 'api_tag_accounts',
                label: 'Ambiente',
                options: {
                    display: true,
                    filter: false,
                    sort: true,
                    customBodyRender: (value, tableMeta, updateValue) => {
                        return (
                            <List horizontal>
                                <List.Item key={uuidv4()}>
                                    <Label key={uuidv4()} color={value.api_tag_account_color}>
                                        {value.api_tag_account_name}
                                    </Label>
                                </List.Item>
                            </List>
                        )
                    },
                },
            },
            {
                name: 'api_tag_accounts',
                label: 'Cuenta',
                options: {
                    display: true,
                    filter: false,
                    sort: true,
                    customBodyRender: (value, tableMeta, updateValue) => {
                        return (
                            <List horizontal>
                                <List.Item key={uuidv4()}>
                                    <Label key={uuidv4()} >
                                        {value.api_tag_account}
                                    </Label>
                                </List.Item>
                            </List>
                        )
                    },
                },
            },
            {
                name: 'api_name',
                label: 'API',
                options: {
                    display: true,
                    filter: true,
                    sort: true,
                    customBodyRender: (value, tableMeta) => {
                        let api_color = tableData[tableMeta.rowIndex].api_color
                        return (
                            <Typography component={'span'} noWrap={false}>
                                <Label key={uuidv4()} color={api_color}>
                                    {value}
                                </Label>
                            </Typography>
                        )
                    },
                },
            },
            {
                name: 'stage_name',
                label: 'Versión',
                options: {
                    display: true,
                    filter: true,
                    sort: true,
                    customBodyRender: (value, tableMeta, updateValue) => {
                        let stage_color = tableData[tableMeta.rowIndex].stage_color
                        return (
                            <Typography component={'span'} noWrap={false}>
                                <Label key={uuidv4()} color={stage_color}>
                                    {value}
                                </Label>
                            </Typography>
                        )
                    },
                },
            },
            {
                name: 'api_is_external',
                label: 'Externa',
                options: {
                    display: false,
                    filter: true,
                    sort: false,
                    customBodyRender: (value) => {
                        return (
                            <Typography component={'span'} noWrap={false}>
                                {value ? (
                                    <Label key={uuidv4()} color={'green'}>
                                    SI
                                    </Label>
                                ) : (
                                    <Label key={uuidv4()} color={'orange'}>
                                    NO
                                    </Label>
                                )}
                            </Typography>
                        )
                    },
                },
            },
            {
                name: 'swagger_data',
                label: 'Acciones',
                options: {
                    display: true,
                    filter: true,
                    sort: true,
                    customBodyRender: (value, tableMeta) => {
                        let tag_account_name = tableMeta.rowData[0]?.api_tag_account_name
                        let _version = tableMeta.rowData[3]
                        let url = `/apis/${business_line}/${value.api_apiid}/${tag_account_name}/${_version}?ext=${value.api_is_external}`
                        return (
                            <Button color={'blue'} onClick={() => navigate(url)}>
                                Ver Swagger
                            </Button>
                        )
                    },
                },
            },
        ]
    }

    return (
        <>
        <br></br>
        <StageTable
            titleIcon={<Icon circular inverted name={'sitemap'} size="small" />}
            title={"APIs - " + business_line?.toUpperCase()}
            columns={tableColumns()}
            data={tableData}
        />
        </>
    )
}
