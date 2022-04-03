import React, { useEffect, useState } from 'react';
import './styles/App.css';
import linkedinLogo from './assets/linkedin-logo.svg';
import contractAbi from './utils/contractABI.json';

import { ethers } from "ethers";
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';

// Constants
const LINKEDIN_HANDLE = 'in/juan-cruz-yañez-075488231/';
const LINKEDIN_LINK = `https://linkedin.com/${LINKEDIN_HANDLE}`;

const tld = ".fresh";
const CONTRACT_ADDRESS = "0xd6D1412e137242880C730B09c159cC6829505601";

const App = () => {

	//Just a state variable we use to store our user's public wallet. Don't forget to import useState at the top.
	const [currentAccount, setCurrentAccount] = useState('');

	const [domain, setDomain] = useState('');
	const [record, setRecord] = useState('');
	const [network, setNetwork] = useState('');

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

	const switchNetwork = async () => {
		if (window.ethereum) {
		  try {
			// Try to switch to the Mumbai testnet
			await window.ethereum.request({
			  method: 'wallet_switchEthereumChain',
			  params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
			});
		  } catch (error) {
			// This error code means that the chain we want has not been added to MetaMask
			// In this case we ask the user to add it to their MetaMask
			if (error.code === 4902) {
			  try {
				await window.ethereum.request({
				  method: 'wallet_addEthereumChain',
				  params: [
					{	
					  chainId: '0x13881',
					  chainName: 'Polygon Mumbai Testnet',
					  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
					  nativeCurrency: {
						  name: "Mumbai Matic",
						  symbol: "MATIC",
						  decimals: 18
					  },
					  blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
					},
				  ],
				});
			  } catch (error) {
				console.log(error);
			  }
			}
			console.log(error);
		  }
		} else {
		  // If window.ethereum is not found then MetaMask is not installed
		  alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
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

		const chainId = await ethereum.request({ method: 'eth_chainId' });
    	setNetwork(networks[chainId]);

    	ethereum.on('chainChanged', handleChainChanged);
    
    	// Reload the page when they change networks
    	function handleChainChanged(_chainId) {
      	window.location.reload();
    	}
	};

	const mintDomain = async () => {
		// Don't run if the domain is empty
		if (!domain) { return }
		// Alert the user if the domain is too short
		if (domain.length < 3) {
			alert('Domain must be at least 3 characters long');
			return;
		}
		// Calculate price based on length of domain (change this to match your contract)	
		// 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
		const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
		console.log("Minting domain", domain, "with price", price);
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
		
				console.log("Going to pop wallet now to pay gas...")
				let tx = await contract.register(domain, {value: ethers.utils.parseEther(price), gasLimit: 4000000});
				// Wait for the transaction to be mined
				const receipt = await tx.wait();
		
				// Check if the transaction was successfully completed
				if (receipt.status === 1) {
					console.log("Domain minted! https://mumbai.polygonscan.com/tx/"+tx.hash);
						
					// Set the record for the domain
					tx = await contract.setRecord(domain, record);
					await tx.wait();
		
					console.log("Record set! https://mumbai.polygonscan.com/tx/"+tx.hash);
						
					setRecord('');
					setDomain('');
				} else {
					alert("Transaction failed! Please try again");
				}
			}
		}
		catch(error){
			console.log(error);
		}
	};

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

	const renderInputForm = () => {
		if (network !== 'Polygon Mumbai Testnet') {
			return (
				<div className="connect-wallet-container">
					<p>Please connect to the Polygon Mumbai Testnet</p>
			  	</div>
			);
		}
		return (
			<div className="form-container">
				<div className="first-row">
					<input
						type="text"
						value={domain}
						placeholder='domain'
						onChange={e => setDomain(e.target.value)}
					/>
					<p className='tld'> {tld} </p>
				</div>

				<input
					type="text"
					value={record}
					placeholder='something fresh'
					onChange={e => setRecord(e.target.value)}
				/>

				<div className="button-container">
					<button className='cta-button mint-button' disabled={null} onClick={mintDomain}>
						Mint
					</button>  
					<button className='cta-button mint-button' disabled={null} onClick={null}>
						Set data
					</button>  
				</div>

			</div>
		);
	}

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
				<div className="right">
					<img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
					{ currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
				</div>
			  </header>
			</div>
	
			{/* Add your render method here */}
			{!currentAccount && renderNotConnectedContainer()}
			{currentAccount && renderInputForm()}
	
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
