"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { TextField, Autocomplete } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { fetchAllFilesTable, fetchFileTypes } from "@/services/api/getFiles";
import { getSubjectsNames } from "@/services/api/getSubjects";
import { FileRow } from "@/constants/interfacesAndTypes";
import columns from "@/constants/table";

export const SearchDataTable = () => {
    const [subjectsOptions, setSubjectsOptions] = React.useState<string[]>([]);
    const [typeFilesOptions, setTypeFilesOptions] = React.useState<string[]>([]);
    const [filesRows, setFilesRows] = React.useState<FileRow[]>([]);
    const [filteredRows, setFilteredRows] = React.useState<FileRow[]>([]);
    const [filters, setFilters] = React.useState({
        name: "",
        subject: "",
        type: "",
        startDate: null,
        endDate: null,
    });

    // Actualizar los filtros
    const handleFilterChange = (field: string, value: any) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    }

    React.useEffect(() => {
        //leemos los parametros de la URL si existen para los filtros
        const searchParams = new URLSearchParams(window.location.search);
        const major = searchParams.get('major');
        const subject = searchParams.get('subject');
        console.log("major: ", major, "subject: ", subject);
        if (subject) {
            handleFilterChange("subject", subject);
        }
        /* if (major) {
            handleFilterChange("major", major);
        } */
        // Fetch data from API
        const fetchingData = async () => {
            try {
                const files = await fetchAllFilesTable();
                const typeFiles = await fetchFileTypes();
                const subjects = await getSubjectsNames();
                setFilesRows(files);
                setFilteredRows(files); // Inicialmente sin filtros
                setSubjectsOptions(subjects);
                setTypeFilesOptions(typeFiles);
            } catch (error) {
                console.error("Error fetching majors:", error);
            }
        }
        fetchingData();
        return () => {
            console.log("SearchDataTable unmounted");
        };
    }, []);

    
    const filterRows = (field: string, filtered: FileRow[]) => {
        if (field) {
            filtered = filtered.filter((row) =>
                row.name.toLowerCase().includes(field.toLowerCase())
            );
        }
        return filtered;
    }

    // Filtrar las filas
    React.useEffect(() => {
        let filtered = filesRows;

        filtered = filterRows(filters.name, filtered);
        filtered = filterRows(filters.subject, filtered);
        filtered = filterRows(filters.type, filtered);

        if (filters.startDate) {
            filtered = filtered.filter(
                (row) => dayjs(row.uploadDate) >= dayjs(filters.startDate)
            );
        }
        if (filters.endDate) {
            filtered = filtered.filter(
                (row) => dayjs(row.uploadDate) <= dayjs(filters.endDate)
            );
        }

        setFilteredRows(filtered);
    }, [filters, filesRows]);

    return (
        <div className="h-full w-full bg-primaryWhite py-8">
            {/* Sección de Filtros */}
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mb: 2,
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                }}
            >
                {/* Filtro por Nombre */}
                <TextField
                    label="Nombre del recurso"
                    variant="outlined"
                    value={filters.name}
                    onChange={(e) => handleFilterChange("name", e.target.value)}
                    sx={{ flex: "1 1 200px" }}
                />

                {/* Filtro por Cátedra */}
                <Autocomplete
                    options={subjectsOptions}
                    value={filters.subject}
                    onChange={(e, value) => handleFilterChange("subject", value)}
                    renderInput={(params) => (
                        <TextField {...params} label="Cátedra" variant="outlined" />
                    )}
                    sx={{ flex: "1 1 200px" }}
                />

                {/* Filtro por Tipo */}
                <Autocomplete
                    options={typeFilesOptions}
                    value={filters.type}
                    onChange={(e, value) => handleFilterChange("type", value)}
                    renderInput={(params) => (
                        <TextField {...params} label="Tipo de recurso" variant="outlined" />
                    )}
                    sx={{ flex: "1 1 200px" }}
                />

                {/*
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Fecha desde"
                        value={filters.startDate}
                        onChange={(value: any) => handleFilterChange("startDate", value)}
                        renderInput={(params: any) => (
                            <TextField {...params} variant="outlined" sx={{ flex: "1 1 200px" }} />
                        )}
                    />
                    <DatePicker
                        label="Fecha hasta"
                        value={filters.endDate}
                        onChange={(value: any) => handleFilterChange("endDate", value)}
                        renderInput={(params: any) => (
                            <TextField {...params} variant="outlined" sx={{ flex: "1 1 200px" }} />
                        )}
                    />
                </LocalizationProvider> */}
            </Box>

            {/* Tabla */}
            <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 5,
                            },
                        },
                    }}
                    pageSizeOptions={[5]}
                    checkboxSelection
                    disableRowSelectionOnClick
                />
            </Box>
        </div>
    );
};
