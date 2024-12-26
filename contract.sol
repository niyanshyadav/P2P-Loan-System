// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract P2PLoan {
    // Mapping of loan IDs to loan details
    mapping(uint256 => Loan) public loans;

    // Mapping of lender addresses to their loan IDs
    mapping(address => uint256[]) public lenderLoans;

    // Mapping of borrower addresses to their loan IDs
    mapping(address => uint256[]) public borrowerLoans;

    // Loan struct
    struct Loan {
        uint256 id;
        address lender;
        address borrower;
        uint256 amount;
        uint256 interestRate;
        uint256 duration;
        uint256 repaymentAmount;
        bool isRepaid;
    }

    // Event emitted when a new loan is created
    event NewLoan(uint256 id, address lender, address borrower, uint256 amount);

    // Event emitted when a loan is repaid
    event LoanRepaid(uint256 id, address borrower);

    // Function to create a new loan
    function createLoan(
        uint256 _amount,
        uint256 _interestRate,
        uint256 _duration,
        address _borrower
    ) public {
        // Generate a unique loan ID
        uint256 loanId = uint256(keccak256(abi.encodePacked(block.timestamp))) % (10**16);

        // Calculate the repayment amount
        uint256 repaymentAmount = _amount + (_amount * _interestRate / 100);

        // Create a new loan
        loans[loanId] = Loan(
            loanId,
            msg.sender,
            _borrower,
            _amount,
            _interestRate,
            _duration,
            repaymentAmount,
            false
        );

        // Add the loan ID to the lender's and borrower's loan lists
        lenderLoans[msg.sender].push(loanId);
        borrowerLoans[_borrower].push(loanId);

        // Emit the NewLoan event
        emit NewLoan(loanId, msg.sender, _borrower, _amount);
    }

    // Function to repay a loan
    function repayLoan(uint256 _loanId) public {
        // Check if the loan exists and the borrower is the one repaying
        require(loans[_loanId].borrower == msg.sender, "Only the borrower can repay the loan.");

        // Check if the loan has already been repaid
        require(!loans[_loanId].isRepaid, "Loan has already been repaid.");

        // Mark the loan as repaid
        loans[_loanId].isRepaid = true;

        // Emit the LoanRepaid event
        emit LoanRepaid(_loanId, msg.sender);
    }
}