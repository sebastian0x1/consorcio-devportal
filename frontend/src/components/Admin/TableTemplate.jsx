import React from "react";
import MUIDataTable, { TableFilterList } from "mui-datatables";
import CustomToolbarSelect from "./CustomToolbarSelect";
import AddIcon from '@material-ui/icons/Add';
import { Typography, Tooltip, IconButton, Chip } from "@material-ui/core";


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

export default function TableTemplate({
    titleIcon,
    title="Title",
    columns,
    data,
    buttons,
    showCreateButton=true,
    createButtonAction,
    createButtonTooltip,
}) {
    const AddButton = () => (
        <Tooltip disableFocusListener title={createButtonTooltip}>
          <IconButton onClick={() => createButtonAction()}>
            <AddIcon />
          </IconButton>
        </Tooltip>
    );
    
    const options = {
        rowHover: true,
        download: false,
        print: false,
        filter: true,
        filterType: "dropdown",
        responsive: 'standard',
        selectableRows: 'single',
        boxShadow: false,
        rowsPerPageOptions: [ 5, 10, 15, 20 ],
        onFilterChange: (column, filterList, type) => {
            // console.log("column", column)
            // console.log("filterList", filterList)
            // console.log("type", type)
        },
        customToolbar: showCreateButton ? AddButton : null,
        customToolbarSelect: (selectedRows, displayData) => {
            let selectedRowId = Object.keys(selectedRows.lookup)[0]
            //console.log("selectedRowId", selectedRowId)
            //console.log("data[selectedRowId]", data[selectedRowId])
            return <CustomToolbarSelect
                buttons={buttons}
                disabled={false}
                data={data[selectedRowId]}
            />
        },
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