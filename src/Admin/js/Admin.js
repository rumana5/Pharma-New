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

        
    usersforapprove=$("#usersforapprove");
    $("#usersforapprove").empty();
    if(App.admindisplay == 2){
           
      $('#approved').show();
      $('#pending').hide();
      $('#rejected').hide();

    } else if(App.admindisplay == 1){
      $('#pending').show();
      $('#rejected').hide();
      $('#approved').hide();

    }else{
      $('#rejected').show();
      $('#approved').hide();
      $('#pending').hide();
    }
  
    var usercount=await App.medicine.usersCount();
          
    for (var i = 0; i < usercount; i++) {
      var accaddr=await App.medicine.addresses(i);
      var user=await App.medicine.users(accaddr);
                          
      var username=user.name;
      var role=user.role;
      var rolename="";
      if(role.localeCompare("1")==0){
        rolename="End User";
      }
      if(role.localeCompare("2")==0){
        rolename="Certification Authorty";
      }
      if(role.localeCompare("3")==0){
        rolename="Distributor";
      }
      if(role.localeCompare("4")==0){
        rolename="Manufacturer";
      }
      var approved=user.approved;
              
      if(App.admindisplay==2){
              
    
        if(approved.localeCompare("true")==0){
          //display approved users
                
          var str = "<tr><td>" + accaddr +"</td><td>"+username+"</td><td>"+rolename+"</td><td><button class='btn btn-danger' onclick='App.rejectUser(`"+String(accaddr)+"`)'>Reject</button></td></tr>";
                
          usersforapprove.append(str);
                
        }
      }else if(App.admindisplay==1){
              
        if(approved.localeCompare("false")==0){
          //display pending users
          var str = "<tr><td>" + accaddr +"</td><td>"+username+"</td><td>"+rolename+"</td><td><button class='btn btn-success' onclick='App.approveUser(`"+String(accaddr)+"`)'>Approve</button> &nbsp <button class='btn btn-danger' onclick='App.rejectUser(`"+String(accaddr)+"`)'>Reject</button></td></tr>";
                
          usersforapprove.append(str);
        }
      }
      else{
            
        if(approved.localeCompare("reject")==0){
          //display rejected users
          var str = "<tr><td>" + accaddr +"</td><td>"+username+"</td><td>"+rolename+"</td></tr>";
              
          usersforapprove.append(str);
              

        }
      }
    } 

  },

  //Display Approved Users
  displayApprovedManufecturer:async ()=>{
    
    App.admindisplay=2;
    await App.render();
  },

  //Display Users to Approve
  displayManufecturertoapprove:async ()=>{
    App.admindisplay=1;  
    await App.render();
  },

  //Display Rejected Users
  displayRejectedManufacturer:async ()=>{
    App.admindisplay=3;  
    await App.render();
  },

  //Approve Users by Admin
  approveUser:async (addr)=>{
    await App.medicine.approveUser(addr.toString(),"true",{ from: App.account });
    await App.render(); 
    alert("User Approved");
  },

  //Reject Users by Admin 
  rejectUser:async (addr)=>{
    await App.medicine.approveUser(addr.toString(),"reject",{ from: App.account });
    await App.render(); 
    alert("User Rejected");
  }

};

$(function () {
  $(window).load(function () {
      App.load();
  });
});

// menu hide
(function($) {
    "use strict";

    // Add active state to sidbar nav links
    var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
        $("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function() {
            if (this.href === path) {
                $(this).addClass("active");
            }
        });

    // Toggle the side navigation
    $("#sidebarToggle").on("click", function(e) {
        e.preventDefault();
        $("body").toggleClass("sb-sidenav-toggled");
    });
})(jQuery);


