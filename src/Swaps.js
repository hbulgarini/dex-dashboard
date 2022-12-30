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
        field: 'type', headerName: 'Type', width: 120,
        renderCell: ({ row }) => <Chip label={row.type} color={row.type === "IN" ? "primary" : "error"} variant="outlined" />

    },
    { field: 'from', headerName: 'From', width: 130, renderCell: ({ row }) => <a target="_blank" href={`https://etherscan.io/address/${row.from}`}> {getNameFromAddressBook(row.addresses, row.from)}</a> },
    { field: 'gasUsed', headerName: 'Gas Used', width: 130 },
    {
        field: 'status',
        headerName: 'Status',
        width: 90,
    },
    {
        field: 'tokenIn',
        headerName: 'Token In',
        width: 120,
        valueGetter: ({ row }) => `${row.tokenIn.symbol}`
    },
    {
        field: 'amountIn',
        headerName: 'Amount In',
        width: 120,
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
        width: 120,
    },
    {
        field: 'price',
        headerName: 'Price',
        width: 120,
    },
    {
        field: 'amountUSD',
        type: 'number',
        headerName: 'Amount USD',
        width: 120,
    },
    {
        field: 'transactionId',
        headerName: 'Transaction Id',
        width: 120,
        renderCell: ({ row }) => <a target="_blank" href={`https://etherscan.io/tx/${row.transactionId}`}> {shortenText(row.id)}</a>
    },
];

export default function Swaps({ swaps, addresses }) {
    console.log('addresses', addresses)
    const addressBook = addresses.length ? addresses.addresses : { addresses: [] }
    console.log('addressBook', addressBook)
    const swapsWithAddressBook = swaps.map(swap => ({ ...swap, addressBook }))
    return (
        <div style={{ height: 800, width: '100%' }}>
            <DataGrid
                rows={swapsWithAddressBook}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
            />
        </div>
    );
}