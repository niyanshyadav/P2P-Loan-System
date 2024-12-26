// Import Web3.js library
const Web3 = require('web3');

// Set up Web3 provider
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

// Set up contract instance
const contractAddress = '0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8'; // Replace with your contract address
const contractAbi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "borrower",
				"type": "address"
			}
		],
		"name": "LoanRepaid",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "lender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "borrower",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "NewLoan",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "borrowerLoans",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_interestRate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_duration",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_borrower",
				"type": "address"
			}
		],
		"name": "createLoan",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "lenderLoans",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "loans",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "lender",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "borrower",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "interestRate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "duration",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "repaymentAmount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isRepaid",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_loanId",
				"type": "uint256"
			}
		],
		"name": "repayLoan",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]; // Replace with your contract ABI
const contract = new web3.eth.Contract(contractAbi, contractAddress);

// Get accounts
web3.eth.getAccounts().then(accounts => {
    console.log(accounts);
});

// Create loan form submission handler
document.getElementById('create-loan-form').addEventListener('submit', async event => {
    event.preventDefault();

    const amount = document.getElementById('amount').value;
    const interestRate = document.getElementById('interest-rate').value;
    const duration = document.getElementById('duration').value;
    const borrower = document.getElementById('borrower').value;

    try {
        const accounts = await web3.eth.getAccounts();
        const tx = await contract.methods.createLoan(amount, interestRate, duration, borrower).send({ from: accounts[0] });
        console.log(tx);
        displayLoans();
    } catch (error) {
        console.error(error);
    }
});

// Repay loan form submission handler
document.getElementById('repay-loan-form').addEventListener('submit', async event => {
    event.preventDefault();

    const loanId = document.getElementById('loan-id').value;

    try {
        const accounts = await web3.eth.getAccounts();
        const tx = await contract.methods.repayLoan(loanId).send({ from: accounts[0] });
        console.log(tx);
        displayLoans();
    } catch (error) {
        console.error(error);
    }
});

// Display loans
async function displayLoans() {
    const accounts = await web3.eth.getAccounts();
    const loanIds = await contract.methods.getLoanIds().call({ from: accounts[0] });
    const loanList = document.getElementById('loan-list');

    loanList.innerHTML = '';

    for (const loanId of loanIds) {
        const loan = await contract.methods.getLoan(loanId).call({ from: accounts[0] });
        const loanListItem = document.createElement('div');
        loanListItem.className = 'loan-list-item';

        loanListItem.innerHTML = `
            <h3>Loan ${loanId}</h3>
            <p>Amount: ${loan.amount}</p>
            <p>Interest Rate: ${loan.interestRate}%</p>
            <p>Duration: ${loan.duration} months</p>
            <p>Borrower: ${loan.borrower}</p>
            <p>Repaid: ${loan.isRepaid ? 'Yes' : 'No'}</p>
        `;

        loanList.appendChild(loanListItem);
    }
}

displayLoans();