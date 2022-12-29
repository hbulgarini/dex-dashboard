import * as React from 'react';
import loadData from './utils/loadData';
import { readAllRecordsFromLocalStorageByPrefix, getDaysLoaded, exportRecords } from './utils/localStorageManager'
import moment from 'moment'
import { sortBy } from 'lodash'
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CircularProgress from '@mui/material/CircularProgress';
import FileUploader from './FileUploader'
import { visuallyHidden } from '@mui/utils';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function shortenText(text) {
    if (text.length <= 10) {
        return text;
    }
    return text.substring(0, 5) + "..." + text.substring(text.length - 5);
}

function AddRemoveLiquidityTable(props) {
    const { rows, action } = props;
    return <>
        {rows.map((tx) => (
            <TableRow key={tx.transaction.id}>
                <TableCell component="th" scope="row">
                    <Chip label={action} color={action === "Add" ? "primary" : "error"} variant="outlined" />
                </TableCell>
                <TableCell align="right">{tx.amount0}</TableCell>
                <TableCell align="right">{tx.amount1}</TableCell>
                <TableCell align="right">
                    <a target="_blank" href={`https://etherscan.io/tx/${tx.transaction.id}`}> {shortenText(tx.transaction.id)}</a>
                </TableCell>
            </TableRow>
        ))}
    </>
}

function Row(props) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);

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
                    <>
                        {row.pairInfo}
                        <Chip label="DEXTOOLS" target="_blank" href={`https://www.dextools.io/app/en/ether/pair-explorer/${row.id}`} color="primary" variant="outlined" component="a" clickable />
                        <Chip label="ETHERSCAN" target="_blank" href={`https://etherscan.io/token/${row.tokenAddress}`} color="secondary" variant="outlined" component="a" clickable />
                    </>

                </TableCell>
                <TableCell align="right">{row.id}</TableCell>
                <TableCell align="right">{row.created}</TableCell>
                <TableCell align="right">{row.token0}</TableCell>
                <TableCell align="right">{row.token1}</TableCell>
                <TableCell align="right">{row.txCount}</TableCell>
                <TableCell align="right">{row.reserveUSD}</TableCell>
                <TableCell align="right">{row.volume}</TableCell>
                <TableCell align="right">{row.initialLiquidity}</TableCell>
                <TableCell align="right">{row.exitLiquidity}</TableCell>
                <TableCell align="right"><>
                    {row.exitResult === "ONGOING" ?
                        <Chip label="On Going" color="warning" variant="outlined" />
                        :
                        row.exitResult
                    }
                </>

                </TableCell>



            </TableRow>
            {<TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                History
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Type</TableCell>
                                        <TableCell align="right">Amount 0</TableCell>
                                        <TableCell align="right">Amount 1</TableCell>
                                        <TableCell align="right">Transaction ID</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <AddRemoveLiquidityTable rows={row.mints} action="Add" />
                                    <AddRemoveLiquidityTable rows={row.burns} action="Remove" />
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>}
        </React.Fragment >
    );
}

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}



const headCells = [
    {
        id: 'pairInfo',
        numeric: false,
        disablePadding: true,
        label: 'Pair Info',
    },
    {
        id: 'id',
        numeric: false,
        disablePadding: true,
        label: 'Pair ID',
    },
    {
        id: 'created',
        numeric: false,
        disablePadding: true,
        label: 'Created At',
    },
    {
        id: 'token0',
        numeric: false,
        disablePadding: false,
        label: 'Token 0',
    },
    {
        id: 'token1',
        numeric: false,
        disablePadding: false,
        label: 'Token 1',
    },
    {
        id: 'txCount',
        numeric: true,
        disablePadding: false,
        label: 'Swaps Count',
    },
    {
        id: 'reserveUSD',
        numeric: true,
        disablePadding: false,
        label: 'Reserve USD',
    },
    {
        id: 'volume',
        numeric: true,
        disablePadding: false,
        label: 'Volume',
    },
    {
        id: 'initialLiquidity',
        numeric: true,
        disablePadding: false,
        label: 'Initial Liquidity',
    },
    {
        id: 'exitLiquidity',
        numeric: true,
        disablePadding: false,
        label: 'Exit Liquidity',
    },
    {
        id: 'exitResult',
        numeric: true,
        disablePadding: false,
        label: 'Exit Result',
    },
];

function EnhancedTableHead(props) {
    const { order, orderBy, rowCount, onRequestSort } =
        props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">

                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
    return (

        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
            }}
        >

            <Typography>
                Show Ongoing
            </Typography>
            <Switch onChange={props.handleShowOnGoing} label="Show Ongoing" />
            <Typography
                sx={{ flex: '1 1 100%' }}
                variant="h6"
                id="tableTitle"
                component="div"
            >
                {props.loadingPairs ? <>
                    <CircularProgress />
                    {props.loadingPairs}
                </> : null}
            </Typography>


            <Tooltip title="Filter list">
                <IconButton>
                    <FilterListIcon />
                </IconButton>
            </Tooltip>
        </Toolbar>
    );
}

EnhancedTableToolbar.propTypes = {
};

export default function EnhancedTable() {
    const [rows, setRows] = React.useState([]);
    const [rowsToShow, setRowsToShow] = React.useState([]);

    const [order, setOrder] = React.useState('desc');
    const [orderBy, setOrderBy] = React.useState('created');
    const [page, setPage] = React.useState(0);
    const [date, setDate] = React.useState(moment().startOf('day').utc());
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);
    const [loadingPairs, setLoadingPairs] = React.useState(null);
    const [daysLoaded, setDaysLoaded] = React.useState([]);
    const [loadFromDB, setLoadFromDB] = React.useState(false);
    const [showOnGoing, setShowOnGoing] = React.useState(false);

    const load = React.useCallback(async () => {
        const from = date.startOf('day').utc().unix();
        const to = date.add(1, "days").startOf('day').utc().unix()
        const dateToLog = date.subtract(1).format("DD/MM/YYYY")
        setLoadingPairs(`Loading pairs from ${dateToLog}`)
        const rowsLoaded = await loadData(from, to, dateToLog)
        if (rowsLoaded.length) {
            let daysLoaded = await getDaysLoaded();
            setDaysLoaded([...daysLoaded, dateToLog])
            setRows(rowsLoaded)
            setRowsToShow(rowsLoaded)

        }

        setLoadingPairs(null)
    }, [date]);

    const download = React.useCallback(async () => {
        await exportRecords()
    }, [date]);

    React.useEffect(() => {
        // declare the data fetching function
        const fetchRowsStored = async () => {
            const rowsLoaded = await readAllRecordsFromLocalStorageByPrefix();
            let daysLoaded = await getDaysLoaded();
            setDaysLoaded(daysLoaded)
            setRows(rowsLoaded)
            setRowsToShow(rowsLoaded)
        }

        // call the function
        fetchRowsStored()
            .catch(console.error);
    }, [loadFromDB])

    React.useEffect(() => {
        // declare the data fetching function
        let newRowsToShowOnGoing = rows.filter(r => {
            if (showOnGoing) {
                return true
            } else if (!showOnGoing && r.exitResult === "ONGOING") {
                return false
            }
            return true
        });

        setRowsToShow(newRowsToShowOnGoing)

    }, [rows, showOnGoing])


    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangeDense = (event) => {
        setDense(event.target.checked);
    };

    const handleShowOnGoing = (event) => {
        setShowOnGoing(event.target.checked);
    };

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rowsToShow.length) : 0;

    console.log(rowsToShow)

    return (
        <Box sx={{ width: '100%' }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%", margin: "10px", width: '100%', height: "100px", "justifyContent": "center" }}>

                <div style={{ margin: "0 10px" }}>
                    <FileUploader loadFromDB={loadFromDB} />
                </div>
                <div style={{ margin: "0 10px" }}>
                    <Button onClick={download} variant="contained">
                        Download Pairs
                    </Button>
                </div>
                <div style={{ margin: "0 10px" }}>
                    <Button onClick={load} variant="contained">
                        Load Pairs
                    </Button>
                </div>
                <div style={{ margin: "0 10px" }}>
                    <DatePicker
                        label="Date"
                        value={date}
                        onChange={(newValue) => {
                            setDate(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </div>

            </div>
            <Typography style={{ 'color': "#000" }}>{daysLoaded.join(", ")}</Typography>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar loadingPairs={loadingPairs} handleShowOnGoing={handleShowOnGoing} />
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    variant="h6"
                    id="tableTitle"
                    component="div"
                >
                    Pairs
                </Typography>
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size={dense ? 'small' : 'medium'}
                    >
                        <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                        />
                        <TableBody>
                            {stableSort(rowsToShow, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {

                                    const labelId = `enhanced-table-checkbox-${index}`;
                                    return (
                                        <Row key={row.id} row={row} />
                                    );
                                })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: (dense ? 33 : 53) * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={rowsToShow.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
            <FormControlLabel
                control={<Switch checked={dense} onChange={handleChangeDense} />}
                label="Dense padding"
            />
        </Box>
    );
}
