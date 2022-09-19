import React, { useState, Fragment } from "react";
import MUIDataTable, { TableFilterList } from "mui-datatables";
import { Typography, Chip } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import LockIcon from '@material-ui/icons/Lock';
import { Modal } from 'semantic-ui-react';

import ConfigCredentials from './ConfigCredentials';

// Here is the custom chip component. For this example, we are 
// using the outlined chip from Material UI:
const CustomChip = ({ label, onDelete }) => {
    return (
        <Chip
            variant="outlined"
            color="secondary"
            label={label}
            onDelete={onDelete}
        />
    );
};

// Here is the custom filter list component that will display
// the custom filter chips:
const CustomFilterList = (props) => {
    return <TableFilterList {...props} ItemComponent={CustomChip} />;
};

// Custom toolbar to add credentials button
const CustomToolbar = ({ open, setOpen }) => {
    return (
        <Fragment>
            <Modal
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                open={open}
                trigger={
                    <Tooltip title="Configurar Credenciales">
                        <IconButton className="button">
                            <LockIcon className="button" />
                        </IconButton>
                    </Tooltip>
                }
            >
                <ConfigCredentials setOpenModal={setOpen} />
            </Modal>
        </Fragment>
    );
}

export default function StageTable({
    titleIcon,
    title="Title",
    columns,
    data,
}) {
    const [open, setOpen] = useState(false)

    const options = {
        download: false,
        print: false,
        filter: true,
        filterType: "dropdown",
        responsive: 'standard',
        selectableRows: 'none',
        boxShadow: false,
        rowsPerPageOptions: [ 5, 10, 15, 20 ],
        customToolbar: () => CustomToolbar({ open, setOpen }),
        textLabels: {
            body: {
                noMatch: 'No se han encontrado resultados.',
                toolTip: "Ordenar",
                columnHeaderTooltip: column => `Ordenado por ${column.label}`,
            },
            pagination: {
                next: "Siguiente",
                previous: "Anterior",
                rowsPerPage: "Filas por Página:",
                displayRows: "de",
            },
            toolbar: {
                search: "Buscar",
                downloadCsv: "Descargar CSV",
                print: "Imprimir",
                viewColumns: "Ver Columnas",
                filterTable: "Filtrar Tabla",
            },
            filter: {
                all: "Todos",
                title: "FILTROS",
                reset: "RESET",
            },
            viewColumns: {
                title: "Ver Columnas",
                titleAria: "Ver/Ocultar Columnas",
            },
            selectedRows: {
                text: "fila(s) seleccionada(s)",
                delete: "Borrar",
                deleteAria: "Borrar Filas Seleccionadas",
            },
        },
    };
    
    return (
        <MUIDataTable
            title={
                <Typography style={{ marginLeft: '10px' }} variant="h4">
                    {titleIcon} {title}
                </Typography>
            }
            data={data}
            columns={columns}
            options={options}
            components={{
                TableFilterList: CustomFilterList,
            }}
        />
    );
}