//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////Coming in part 3//////////////////////////////////////////////////////////////////

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Button,
  Grid,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { ArrowBack, Search, FileDownload } from '@mui/icons-material';

//////////////////////////////////////////////////////////////////VARIABLES//////////////////////////////////////////////////////////////////
const TransactionHistory = ({ onBack }) => {
//////////////////////////////////////////////////////////////////VARIABLES//////////////////////////////////////////////////////////////////
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');

  const transactions = [
    {
      id: 'TXN-001',
      date: '2025-09-23',
      type: 'Payment',
      description: 'Payment to John Doe',
      amount: -250.00,
      status: 'Completed',
      reference: 'Dinner payment'
    },
    {
      id: 'TXN-002',
      date: '2025-09-22',
      type: 'Deposit',
      description: 'Salary Deposit',
      amount: 3500.00,
      status: 'Completed',
      reference: 'Monthly salary'
    },
    {
      id: 'TXN-003',
      date: '2025-09-21',
      type: 'Payment',
      description: 'Payment to ABC Store',
      amount: -125.50,
      status: 'Pending',
      reference: 'Online purchase'
    },
    {
      id: 'TXN-004',
      date: '2025-09-20',
      type: 'Withdrawal',
      description: 'ATM Withdrawal',
      amount: -100.00,
      status: 'Completed',
      reference: 'Cash withdrawal'
    },
    {
      id: 'TXN-005',
      date: '2025-09-19',
      type: 'Payment',
      description: 'Payment to Jane Smith',
      amount: -75.25,
      status: 'Failed',
      reference: 'Book payment'
    },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAmountColor = (amount) => {
    return amount > 0 ? '#2e7d32' : '#d32f2f';
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type.toLowerCase() === filterType;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleExport = () => {
    // Implement export functionality
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ff9800 0%, #2196f3 100%)', p: 3 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button 
              startIcon={<ArrowBack />} 
              onClick={onBack}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h5" fontWeight="bold">
              Transaction History
            </Typography>
          </Box>

          {/* Filters */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Search transactions"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Transaction Type"
                fullWidth
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="payment">Payment</MenuItem>
                <MenuItem value="deposit">Deposit</MenuItem>
                <MenuItem value="withdrawal">Withdrawal</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Date Range"
                fullWidth
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FileDownload />}
                onClick={handleExport}
                sx={{ height: '56px' }}
              >
                Export
              </Button>
            </Grid>
          </Grid>

          {/* Transaction Table */}
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Transaction ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Reference</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {transaction.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.type} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {transaction.reference}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        sx={{ color: getAmountColor(transaction.amount) }}
                      >
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.status}
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredTransactions.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No transactions found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionHistory;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////