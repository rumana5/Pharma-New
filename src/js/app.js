App = {
  loading: false,
  contracts: {},
  manfdisplay:0,
  admindisplay:1,

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
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
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = App.acc[0];  
    
  },
  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const Medicine = await $.getJSON('Medicine.json')
    App.contracts.Medicine = TruffleContract(Medicine)
    App.contracts.Medicine.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.medicine = await App.contracts.Medicine.deployed()
  },
  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }
    // Update app loading state
      App.setLoading(true)      
      var home = $("#home");  
      var register = $("#register");   
      var distributorpage=$('#distributorpage');

      var user=await App.medicine.users(App.account);
      console.log(user);
      var role=user.role;
      var approved=user.approved;
      console.log("role="+role);      
      var username=user.name;

      

      $("[id='accountAddress']").html(username+"("+App.account+")");
      // if(role=="1"){
      //   //End User
      // }
      // else if(role=="2"){
      //   //C.A
      // }
      if(approved.localeCompare("false")==0){
        alert("Waiting for approval from admin");
        return
      }else if(approved.localeCompare("reject")==0){
        alert("Sorry, you cannot login to our website");
        return

      }
        if(role=="3"){
          //Distributor
          $("#displayMedicine").empty();
        var count= await App.medicine.medicineCount();
        console.log(count);
        for (var i = 1; i <= count; i++) {
           var medicine=await App.medicine.medicines(i);
           console.log(medicine);
           var accountaddrees=medicine[2];
            var id=medicine[0];
             var medname=medicine[1];  
             //Display name of manufacturer from ethereum address    
             var user=await App.medicine.users(medicine[2]);
             var manfact=user.name;      
             var expdate=medicine[5]
             var category=medicine[6];
             var price=medicine[7];
             var str = "<tr><td>" + id +"</td><td>"+medname+"</td><td>"+manfact+"</td><td>"+expdate+"</td><td>"+category+"</td><td>"+price+"</td><td><button class='btn btn-info'>Buy</button></td></tr>";
             $("#displayMedicine").append(str); 
        }

        console.log("approved distributor");
        distributorpage.show();
        home.hide();
        register.hide();
        

      }
        
        else if(role=="4"){
          // crudOperation.show();
          //Manufacturer

          window.location.replace('Manufacturer/index.html');
          
          distributorpage.hide();
          
        }
        else{

         
          admin=await App.medicine.admin();       
          if(admin.toUpperCase().localeCompare(App.account.toUpperCase())==0){
            window.location.replace('Admin/index.html');
            
          }
          else{
            //New User
            //New User
              home.hide();
              
              register.show();
              
              distributorpage.hide();
          }
          
        }
  
      App.setLoading(false)
    },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  },
  

  registerRole:async ()=>{
    var userFullname=$("#userFullname").val();
    var userAddress=$("#userAddress").val();
    var role=$("#RoleSelect").val();
    //console.log("Selected role is=",role);     
    console.log("Before sending to BC userAddress="+userAddress+"userRole="+role+"name="+userFullname);
    await App.medicine.registerRoles(userFullname,userAddress,role,"false", { from: App.account });      
    alert("Registered successfully"); 
    await App.render();
   }
 

}



function loginClick(){
  //alert("MetaMask Connection clicked");
  App.load();
}
