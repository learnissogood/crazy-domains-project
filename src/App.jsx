import React, { useEffect, useState } from 'react';
import './styles/App.css';
import linkedinLogo from './assets/linkedin-logo.svg';

// Constants
const LINKEDIN_HANDLE = 'in/juan-cruz-yañez-075488231/';
const LINKEDIN_LINK = `https://linkedin.com/${LINKEDIN_HANDLE}`;

const App = () => {

	//Just a state variable we use to store our user's public wallet. Don't forget to import useState at the top.
	const [currentAccount, setCurrentAccount] = useState('');

	const connectWallet = async () => {
		try {
		  const { ethereum } = window;
	
		  if (!ethereum) {
			alert("Get MetaMask -> https://metamask.io/");
			return;
		  }
	
		  // Fancy method to request access to account.
		  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
		
		  // Boom! This should print out public address once we authorize Metamask.
		  console.log("Connected", accounts[0]);
		  setCurrentAccount(accounts[0]);
		} catch (error) {
		  console.log(error)
		}
	};

	const checkIfWalletIsConnected = async () => {
		// Creating a function that allow us find out if we have access to window.ethereum object
		const { ethereum } = window;

		if (!ethereum) {
			console.log("Make sure you have Metamask!");
			return;
		} else {
			console.log("We have the ethereum object!", ethereum);
		}

		// Check if we're authorized to access the user's wallet
		const accounts = await ethereum.request({ method: 'eth_accounts' });

		// Users can have multiple authorized accounts, we grab the first one if its there!
		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log('Found an authorized account: ', account);
			setCurrentAccount(account);
		} else {
			console.log('No authorized account found');
		}
	}

	// Creating a function to render if wallet is not connected yet
	// Create a function to render if wallet is not connected yet
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
		  <img src="https://media.giphy.com/media/fZ8nPr0pS3J93o2dZJ/giphy.gif" alt="Fresh gif" />
		  <button onClick={connectWallet} className="cta-button connect-wallet-button">
			Connect Wallet
		  </button>
		</div>
	);

	// This useEffect runs our function when the page loads
	useEffect(() => {
		checkIfWalletIsConnected();
	}, [])

	return (
		<div className="App">
		  <div className="container">
			<div className="header-container">
			  <header>
				<div className="left">
				<p className="title"> Fresh Name Service</p>
				<p className="subtitle">Your immortal API on the blockchain!</p>
				</div>
			  </header>
			</div>
	
			{/* Add your render method here */}
			{!currentAccount && renderNotConnectedContainer()}
	
			<div className="footer-container">
			  <img alt="Linkedin Logo" className="linkedin-logo" src={linkedinLogo} />
			  <a className="footer-text" 
				href={LINKEDIN_LINK} 
				target="_blank"
				rel="noreferrer">
				  {`built by @${LINKEDIN_HANDLE}`}
			  </a>
			</div>
		  </div>
		</div>
	  );
};

export default App;
