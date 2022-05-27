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
import _ from "lodash"


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

const getRows = (tab, sessions) => {
  let rows = []
  for (let i = 0; i < 5; i++) {
    let columns = {}
    let rank = `Rank ${i + 1}`
    sessions.forEach((session, j) => {
      let tabData = tab === 0 ? session.options.call : session.options.put
      if(!_.isEmpty(tabData)){
      columns[`session${j + 1}`] = tabData[i].name
      }
    })
    columns['rank'] = rank
    rows.push(columns)
  }
  console.log(rows)
  return rows
};

export const CustomizedTables = (tab, sessions) => {
  let rows = getRows(tab, sessions)
  return (
    <TableContainer component={Paper} style={{ maxHeight: 320 }}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table" stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell>Rank</StyledTableCell>
            {sessions.map(session => <StyledTableCell align="left">{new Date(new Date(session.time).getTime()+19800000).toLocaleTimeString()}</StyledTableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <StyledTableRow key={row.rank}>
              <StyledTableCell component="th" scope="row">
                {row.rank}
              </StyledTableCell>
              {Object.values(row).map((session, i) => i !== Object.values(row).length - 1 ? <StyledTableCell style={{color:tab ===0?"#8884d8":"#f59542"}} align="left">{session}</StyledTableCell> : null)}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
