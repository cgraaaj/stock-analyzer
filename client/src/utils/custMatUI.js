import { createTheme } from "@mui/material/styles"
import { common } from '@mui/material/colors'
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


export const custTheme = createTheme({
  palette: {
    secondary: {
      main: common.black
    }
  }
})

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const createData = (tab,session) => {
let tabData = tab === 0? session.options.call:session.options.put
let sessionTime = new Date(session.time).toLocaleTimeString()
console.log(sessionTime)
let rank1 = tabData[0].name
let rank2 = tabData[1].name
let rank3 = tabData[2].name
let rank4 = tabData[3].name
let rank5 = tabData[4].name
  return { sessionTime,rank1,rank2,rank3,rank4,rank5 };
}

const getRows = (tab,sessions) => {
  console.log(sessions)
  return sessions.map(session=>createData(tab,session))
};

export const CustomizedTables = (tab,sessions) => {
  let rows = getRows(tab,sessions)
  return (
    <TableContainer component={Paper} style={{ maxHeight: 300 }}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table" stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell>Sessions</StyledTableCell>
            <StyledTableCell align="right">Rank 1</StyledTableCell>
            <StyledTableCell align="right">Rank 2</StyledTableCell>
            <StyledTableCell align="right">Rank 3</StyledTableCell>
            <StyledTableCell align="right">Rank 4</StyledTableCell>
            <StyledTableCell align="right">Rank 5</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <StyledTableRow key={row.sessionTime}>
              <StyledTableCell component="th" scope="row">
                {row.sessionTime}
              </StyledTableCell>
              <StyledTableCell align="right">{row.rank1}</StyledTableCell>
              <StyledTableCell align="right">{row.rank2}</StyledTableCell>
              <StyledTableCell align="right">{row.rank3}</StyledTableCell>
              <StyledTableCell align="right">{row.rank4}</StyledTableCell>
              <StyledTableCell align="right">{row.rank5}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
