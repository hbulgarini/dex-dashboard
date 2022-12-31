import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';
import { loadMoreInfoPair, calculateTotalSwapOut, calculateTotalSwapIn, calculateAllGasUsed, getNameFromAddressBook } from './utils/loadMoreInfoPair'

function shortenText(text) {
    if (text.length <= 10) {
        return text;
    }
    return text.substring(0, 5) + "..." + text.substring(text.length - 5);
}


const columns = [
    {
        field: 'type', headerName: 'Type', width: 60, resizable: true,
        renderCell: ({ row }) => <Chip label={row.type} color={row.type === "IN" ? "primary" : "error"} variant="outlined" />

    },
    {
        field: 'created', headerName: 'Date', width: 250,

    },
    { field: 'from', headerName: 'From', width: 130, renderCell: ({ row }) => <a target="_blank" href={`https://etherscan.io/address/${row.from}`}> {getNameFromAddressBook(row.addresses, row.from)}</a> },
    { field: 'gasUsed', headerName: 'Gas Used', width: 200 },
    {
        field: 'status',
        headerName: 'Status',
        width: 90,
    },
    {
        field: 'tokenIn',
        headerName: 'Token In',
        width: 100,
        valueGetter: ({ row }) => `${row.tokenIn.symbol}`
    },
    {
        field: 'amountIn',
        headerName: 'Amount In',
        width: 200,
    },
    {
        field: 'tokenOut',
        headerName: 'Token Out',
        width: 120,
        valueGetter: ({ row }) => `${row.tokenOut.symbol}`
    },
    {
        field: 'amountOut',
        headerName: 'Amount Out',
        width: 250,
    },
    {
        field: 'price',
        headerName: 'Price',
        width: 200,
    },
    {
        field: 'amountUSD',
        type: 'number',
        headerName: 'Amount USD',
        width: 100,
    },
    {
        field: 'transactionId',
        headerName: 'Transaction Id',
        width: 250,
        renderCell: ({ row }) => <a target="_blank" href={`https://etherscan.io/tx/${row.transactionId}`}> {shortenText(row.id)}</a>
    },
];

export default function Swaps({ swaps, addresses }) {
    const swapsWithAddressBook = swaps.map(swap => ({ ...swap, addresses }))
    return (
        <div style={{ height: 800, width: 2000 }}>
            <DataGrid
                rows={swapsWithAddressBook}
                columns={columns}
                pageSize={25}
                rowsPerPageOptions={[25]}
            />
        </div>
    );
}