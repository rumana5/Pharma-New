App = {
    web3Provider: null,
    contracts: {},
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    admindisplay:2,
    
    load: async function () {
        
        /// Setup access to blockchain
        return await App.initWeb3();
    },
  
    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
       //var Web3 = require('web3')  ;  
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
      } else {
  
        //web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
  
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          App.acc=await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
      App.getMetaskAccountID();
          
  
          return App.loadContract();;
    },
  
    //Get Metamask Account
    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider);
        App.account = App.acc[0];
  
    },
  
    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const Medicine = await $.getJSON('../Medicine.json')
      App.contracts.Medicine = TruffleContract(Medicine)
      App.contracts.Medicine.setProvider(App.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      App.medicine = await App.contracts.Medicine.deployed()
  
      return App.render();
    },
  
    render: async () => {
  
    },

    //Register Users
    registerRole:async ()=>{
        var userFullname=$("#userFullname").val();
        var userAddress=$("#userAddress").val();
        var role=$("#RoleSelect").val();
        await App.medicine.registerRoles(userFullname,userAddress,role,"false", { from: App.account });      
        alert("Registered successfully"); 
        window.location.replace('./index.html');

        await App.render();
   
  }
}

  
  $(function () {
    $(window).load(function () {
        App.load();
    });
  });
  
  
 
  
  