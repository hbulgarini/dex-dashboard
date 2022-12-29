import * as React from 'react';
import { useCallback, useState, useEffect } from 'react';
import loadData from './utils/loadData';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid'
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';


function Row(props) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.pairInfo}
                </TableCell>
                <TableCell align="right">{row.token0}</TableCell>
                <TableCell align="right">{row.token1}</TableCell>
                <TableCell align="right">{row.result.initialLiquidity}</TableCell>
                <TableCell align="right">{row.result.exitLiquidity}</TableCell>
            </TableRow>
            {/*             <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                History
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Customer</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                        <TableCell align="right">Total price ($)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.history.map((historyRow) => (
                                        <TableRow key={historyRow.date}>
                                            <TableCell component="th" scope="row">
                                                {historyRow.date}
                                            </TableCell>
                                            <TableCell>{historyRow.customerId}</TableCell>
                                            <TableCell align="right">{historyRow.amount}</TableCell>
                                            <TableCell align="right">
                                                {Math.round(historyRow.amount * row.price * 100) / 100}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow> */}
        </React.Fragment>
    );
}





export default function DataTable() {
    const [rows, setRows] = useState([])
    const load = useCallback(async () => {
        const rowsLoaded = await loadData()
        setRows(rowsLoaded)
    }, []);

    console.log('rows', rows)

    const columns = [
        {
            field: 'tokenAddress', headerName: 'Token Address',
            renderCell: (params) => <a href={`https://etherscan.io/token/${params.row.tokenAddress}`} > {params.row.tokenAddress}</a >
        },
        { field: 'pairInfo', headerName: 'Pair Info' },
        { field: 'token0', headerName: 'Token 0' },
        { field: 'token1', headerName: 'Token 1' },

        {
            field: 'result.initialLiquidity', width: 300, headerName: 'Initial Liquidity', valueGetter: (params) => params.row.result.initialLiquidity,
        },

    ]
    return (
        <>
            <Button onClick={load} variant="contained">Load Pairs</Button>
            {/*             <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={25}
                    rowsPerPageOptions={[25]}
                    disableSelectionOnClick
                    experimentalFeatures={{ newEditingApi: true }}
                />
            </Box> */}
            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Pair Info</TableCell>
                            <TableCell align="right">Token 0</TableCell>
                            <TableCell align="right">Token 1</TableCell>
                            <TableCell align="right">Initial Liquidity</TableCell>
                            <TableCell align="right">Exit Liquidity</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <Row key={row.name} row={row} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}