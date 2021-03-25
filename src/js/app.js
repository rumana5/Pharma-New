App = {
  loading: false,
  contracts: {},
  manfdisplay:0,
  admindisplay:1,
  allblocks:[],
  displayData:0,
  arr:[],
  similarArr:[],
  minPrice:1,
  maxPrice:100,
  medicineIdforendUserBuy:0,
  medicineforendusersID:0,
  qtyselectedbyenduser:0,
  quantity:0,
  qty:0,
  puchasethroughcart:0,

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  showProductPage :async (id,i) => {
    //window.alert("clicked view page" +id);
    var med=await App.medicine.medicines(parseInt(id));
    
    var descdire= await App.medicine.meddescdirections(parseInt(id));
    var description=descdire.description;
    var direction=descdire.direction;   
    var user=await App.medicine.users(med.manufaname);
    var username=user.name; 
     //console.log(med);
    var price=med.price;
    var medicineforenduser=await App.medicine.medicineforendusers(parseInt(i));
    var qty=medicineforenduser.qty;
   
    App.quantity=parseInt(qty);
    App.medicineIdforendUserBuy=id;
    App.medicineforendusersID=i;
    //window.alert(price);
    //window.alert(price);

    $("#displayprice").html("€ "+price.toString());
    $("#displayquantity").html(qty.toString());
    $("#productName").html(med.medname); 
    $("#distributername").html(medicineforenduser.distributer); 
    $("#manufacturerName").html(username);
    
    $("#displaydescription").html(description);
    $("#displaydirections").html(direction);  

    var btn= `<a href="javascript:void(0)" onclick="App.showCard(this)" class='add-to-cart btn btn-primary' data-price=${price} data-name=${med.medname} data-id=${i}>Add to Cart</a> `;
    var btn1= `<a href="javascript:void(0)" onclick="App.showBuyPage()" class='add-to-cart btn btn-primary' data-price=${price} data-name=${med.medname}>Buy Now</a> `;

    $("#addtocart1").append(btn);
    
    $("#buynow").append(btn1);

    var str=`<div class="col-md-4 col-lg-3 viewBtn"><button type="button" class="btn btn-primary btn-block" data-toggle='modal' data-target='#exampleModalLong' onclick="App.trackProduct('`+id+`')">Track Product</button></div>`+" "+`<div class="col-md-4 col-lg-3 viewBtn"><button type="button" class="btn btn-primary btn-block" data-toggle='modal' data-target='#exampleModalLong1' onclick="App.viewCertificate('`+med.medname+`')">View Certificate</button></div>`;
    
    $("#displaytrackbutton").html(str);
    $("#categorypage").hide();
    $("#productpage").show();

    App.showsimilarproducts(id);
  },

  showsimilarproducts : async(id) => {
    if(App.similarArr.length>0){
    var Category = App.similarArr[id].categoryName;

    $("#displaymedicines").empty();

    for (var i in App.similarArr) 
    {
      if(App.similarArr[i].id != id){

        if(App.similarArr[i].categoryName==Category){

          var str=`<div class="col-md-4 col-sm-6"><div class="product-grid2"><div class="product-image2"> <a> <img class="pic-1" src="../images/medicine.jpg"> </a><ul class="social"><li><a href="javascript:void(0)" onclick="App.showProductPage('`+App.similarArr[i].id+`')" data-tip="Quick View"><i class="fa fa-eye"></i></a></li></ul></div><div class="product-content"><h3 class="title"><a>${App.similarArr[i].name}</a></h3> <span class="price">${App.similarArr[i].price + " €"}</span></div></div></div>`
          $("#displaymedicines").append(str);
        }
      }
    }
  }
  },

  //Listen for events emitted from the contract
listenForEvents:async  function() {   
  
  var instance=await App.contracts.Medicine.deployed();
    instance.getPastEvents("updatedMedicine", { fromBlock: 0 }).then((events) => {
      //window.alert("previous event");
      App.allblocks.push(events);          
    });
    instance.contract.events.updatedMedicine({
      filter: {}, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: 'latest'
  }, function(error, event){ 
    //console.log(event); 
  })
  .on('data', function(event){
      //console.log(event); // same results as the optional callback above
      //window.alert("event cPTURD");
      App.allblocks.push(event); 
      
  })
  .on('changed', function(event){
      // remove event from local database
      window.alert("event on Changed");
  })
  .on('error', console.error);
},

trackProduct :async (id) => { 
  //window.alert("Tracking ID"+id); 
  //console.log("Tracking");
   // console.log(App.allblocks[0]) ;
    // trackdisplay=$("#trackdisplay");
    var id=parseInt(id);  
    var medicine=await App.medicine.medicines(id); 
    $("#trackdisplayenduser").empty();
    // console.log(App.allblocks);

    for(var i=0;i<App.allblocks[0].length;i++){
      
      var block= App.allblocks[0][i];
      console.log(block);
      //console.log("Tracking");
      //.log(block.args[0].toNumber());
      if(block.args[0].toNumber()==id)
      {    
        var user=await App.medicine.users(block.args[2].toString());
        var userName=user.name; 
        var roleName, roleAddress;
        var link="https://kovan.etherscan.io/tx/"+block.transactionHash;
        // var add="https://kovan.etherscan.io/address/0xa1ce9e5c627c8e06d55a169972d7c1a370bbf7fd";
        console.log(block.transactionHash);
        
        var role = user.role;
         if(role == 4){
           roleName = "Manufacturer Name";
           roleAddress = "Manufacturer Address";

         }
         else{
          roleName = "Distributor Name";
          roleAddress = "Distributor Address";
         }
        console.log(userName);
        
        var str="<a class='btn btn-success' href='"+link+"' target=_blank style='margin-bottom:15px; float:right'>View on Etherscan</a><table class='tableTrack table-striped table-borderless' width='100%' cellspacing='0'><tr><th>Medicine Name</th><td>"+block.args[1].toString()+"</td></tr><tr><th>"+roleName+"</th><td>"+userName+"</td></tr> <tr><th>"+roleAddress+"</th><td>"+block.args[2].toString()+"</td></tr><tr><th>Batch No</th><td>"+block.args[3].toString()+"</td></tr><tr><th>Manufacture Date</th><td>"+block.args[4].toString()+"</td></tr><tr><th>Expiry Date</th><td>"+block.args[5].toString()+"</td></tr><tr><th>Category</th><td>"+block.args[6].toString()+"</td></tr><tr><th>Qty</th><td>"+block.args[7].toNumber().toString()+"</td> </table>";
          console.log("Tracking") ;
          $("#trackdisplayenduser").append(str);                                                    
      } 
   }
   
  },

  loadHome :async () => {

    if (localStorage.getItem("categoryName") === "undefined") {
      localStorage.setItem("categoryName","All");
    }
    var clickedCategory = localStorage.getItem("categoryName");

    if(clickedCategory!="All")

      $("[id='nameCategory']").html(clickedCategory);
    
    var options = '';
    const spinner = document.getElementById("spinner");
    $("#categorypage").show();
    $("#productpage").hide();
    $('#boxscroll').empty();
    $("#displaymedicinesofdistributer").empty();
    spinner.removeAttribute('hidden');

    //await App.loadContract1();
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    var count=await App.medicine.medicineforendusersCount();
    //window.alert("count="+count);
    for(var i=1;i<=count;i++){
      var medicine=await App.medicine.medicineforendusers(i);
      var med=await App.medicine.medicines(parseInt(medicine.medicineid));
      var category = await med.category;

      var manufactName = med.manufaname;
      var user=await App.medicine.users(manufactName);
      var username=user.name;
      
      var price=med.price;
      if(App.displayData==0){

        var found = App.arr.some(el => el.name === username);
  
        if(category==clickedCategory){
          
          App.similarArr.push({ id: medicine.medicineid,name: medicine.medicinename, price: price, categoryName: category });

          if(found){
        
          } else {
           App.arr.push({ id: App.arr.length + 1,name: username, status: true });
          } 

        } else if(clickedCategory=="All"){

          App.similarArr.push({ id: medicine.medicineid,name: medicine.medicinename, price: price, categoryName: category });
         
          if(found){
        
          } else {
           App.arr.push({ id: App.arr.length + 1,name: username, status: true });
          } 
        }

      }

      let obj = App.arr.find((o) => {
        if (o.name === username) {
          if(category == clickedCategory){
            if(o.status){
              if(Number(price)>=Number(App.minPrice) && Number(price)<=Number(App.maxPrice)){
                var str=`<div class="col-md-4 col-sm-6"><div class="product-grid2"><div class="product-image2"> <a> <img class="pic-1" src="../images/medicine.jpg"> </a><ul class="social"><li><a href="javascript:void(0)" onclick="App.showProductPage('`+medicine.medicineid+`','`+i+`')" data-tip="Quick View"><i class="fa fa-eye"></i></a></li></ul></div><div class="product-content"><h3 class="title"><a>${medicine.medicinename}</a></h3> <span class="price"></span><span class="price">${"€ "+price}</span></div></div></div>`
               
                $("#displaymedicinesofdistributer").append(str);
              }
            }
            return true;

          }else if(clickedCategory == "All"){
            if(o.status){
              if(Number(price)>=Number(App.minPrice) && Number(price)<=Number(App.maxPrice)){
                var str=`<div class="col-md-4 col-sm-6"><div class="product-grid2"><div class="product-image2"> <a> <img class="pic-1" src="../images/medicine.jpg"> </a><ul class="social"><li><a href="javascript:void(0)" onclick="App.showProductPage('`+medicine.medicineid+`','`+i+`')" data-tip="Quick View"><i class="fa fa-eye"></i></a></li></ul></div><div class="product-content"><h3 class="title"><a>${medicine.medicinename}</a></h3> <span class="price"></span><span class="price">${"€ "+price}</span></div></div></div>`
               
                $("#displaymedicinesofdistributer").append(str);
              }
            }
          }
        }
      });
    }

    for (var i in App.arr) 
    {
      if(App.arr[i].status)
          options += '<input type="checkbox" class="filled-in chk-col-blue" name="checkbox" id="checkbox-' + i + '" value="' + i + '" class="custom" checked="true" onchange="App.myFunction(this);" />';
      else
          options += '<input type="checkbox" class="filled-in chk-col-blue" name="checkbox" id="checkbox-' + i + '" value="' + i + '" class="custom" onchange="App.myFunction(this);" />';
           
      options += '<label for="checkbox-' + i + '">' + App.arr[i].name + '</label>';
      options += '<br>';

      $('#boxscroll').append(options);      
      options = '';   
    }
    spinner.setAttribute('hidden', '');
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
    App.listenForEvents();
  },
  loadContract1: async () => {
    // Create a JavaScript version of the smart contract
   // window.alert("called");
    const Medicine = await $.getJSON('Medicine.json')
    App.contracts.Medicine = TruffleContract(Medicine);

    //if hosted in kovan or rinkeby then use  "https://rinkeby.infura.io/v3/..." istead of localhost
     web3 = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/84f14847ade746d6a1265dcb3c518972"));
   // web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
    App.contracts.Medicine.setProvider(web3.currentProvider)

    // Hydrate the smart contract with values from the blockchain
    App.medicine = await App.contracts.Medicine.deployed()
    App.listenForEvents();
  },
  myFunction:async(elem)=>{

    App.displayData=1;

    var manuName = $("#"+elem.id).next().text();
    
    if (elem.checked)
    {
      console.log("checked");
      for (var i in App.arr) {
        if (App.arr[i].name == manuName) {
          App.arr[i].status = true;
          break; 
        }
      }
    }
    else
    {
      console.log("unchecked");
      for (var i in App.arr) {
        if (App.arr[i].name == manuName) {
         App.arr[i].status = false;
         break;
        }
      }
    }
    await App.loadHome();
  },

  searchMedicineByEndUser :async () =>{
    $("#close").show();
    var mednamesearch=$("#medicinesearchbyEndUser").val();    
      // window.alert("Home display");
      $("#displaysearchedmedicine").empty();
      //await App.loadContract1();
      await App.loadWeb3()
      await App.loadAccount()
      await App.loadContract()
      var count=await App.medicine.medicineforendusersCount();
      for(var i=1;i<=count;i++){
        var medicine=await App.medicine.medicineforendusers(i);
        var med=await App.medicine.medicines(parseInt(medicine.medicineid));
        var price=med.price;
        var medicinename=med[1];
        var descdire= await App.medicine.meddescdirections(parseInt(medicine.medicineid));
        var description=descdire.description;
        var direction=descdire.direction;
        var str="";
        console.log(medicinename+" "+mednamesearch);
        if(medicinename.toLowerCase().localeCompare(mednamesearch.toLowerCase())==0){

          console.log("search");
         
           str=`<div class="col-md-4 col-sm-6 searchimg"><div class="product-grid2"><div class="product-image2"> <a> <img class="pic-1" id="pic-1" src="../images/medicine.jpg"></a><ul class="social"><li><a href="javascript:void(0)" onclick="App.showProduct()" data-tip="Quick View"><i class="fa fa-eye"></i></a></li></ul></div><div class="product-content"><h3 class="title"><a>${medicine.medicinename}</a></h3> <span class="price">${price}</span></div></div></div>`
          
          }  
          console.log(str);

        //var description=med.description       
        $("#displaysearchedmedicine").append(str);
      }
      // $("#displaycategories").hide();
      $("#displaysearchedmedicine").show();
      //await App.render();
  },

  clearSearch :async () =>{
    $('#displaysearchedmedicine').hide();
    document.getElementById('medicinesearchbyEndUser').value = '';
    $("#close").hide();

    //await App.loadContract1();
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
  },

  showAllMedicines :async () => {
    //window.alert("Home display");
    
   

    $("#showAllMedicines").empty();
   // await App.loadContract1();
   await App.loadWeb3()
   await App.loadAccount()
   await App.loadContract()
    
    var count=await App.medicine.medicineforendusersCount();
    
    for(var i=1;i<=count;i++){
      var medicine=await App.medicine.medicineforendusers(i);
      var med=await App.medicine.medicines(parseInt(medicine.medicineid));

      var manufactName = med.manufaname;
      var user=await App.medicine.users(manufactName);
      var username=user.name;
      var price=med.price + " €";
      var descdire= await App.medicine.meddescdirections(parseInt(medicine.medicineid));
      var description=descdire.description;
      var direction=descdire.direction;

     
      //var description=med.description
      //var str=`<div class="big-box col-md-5"><div class="big-img-box"><img src="images/product/2.jpg" alt="#" /></div><div class="big-dit-b clearfix"><div class="col-md-6"><div class="left-big"><h3>${medicine.medicinename}</h3><p>${description}</p><div class="prod-btn"><a href="#"><i class="fa fa-star" aria-hidden="true"></i> Save to wishlist</a></div></div></div><div class="col-md-6"><div class="right-big-b"><div class="tight-btn-b clearfix"><button class="btn btn-primary" onclick="App.showProductPage('`+medicine.medicineid+`')">View</button><a href="#">${price}</a></div></div></div></div></div>`
      var str=`<div class="col-md-4 col-sm-6"><div class="product-grid2"><div class="product-image2"> <a> <img class="pic-1" src="../images/medicine.jpg">  </a><ul class="social"><li><a href="javascript:void(0)" onclick="App.showProductPage('`+medicine.medicineid+`')" data-tip="Quick View"><i class="fa fa-eye"></i></a></li></ul></div><div class="product-content"><h3 class="title"><a>${medicine.medicinename}</a></h3> <span class="price">${price}</span></div></div></div>`
      $("#showAllMedicines").append(str);

      
    $("#showAllMedicines").show();
    }
},

showBuyPage :async () =>{
  //window.alert(App.medicineIdforendUserBuy);
  //console.log("payment");
  $('.modal').modal('hide');
  $('body').removeClass('modal-open');
  $('.modal-backdrop').remove();

  var medicine=await App.medicine.medicines(parseInt(App.medicineIdforendUserBuy));
  var medprice=medicine[7];       
  //App.qty=$("#qtyselect").val();
  //console.log(medprice+"---"+App.qty);
  var cartArray = shoppingCart.listCart();
  if(cartArray.length==0){

    alert("Please first add to cart");
  }else{
  //window.alert(qty)
  App.qtyselectedbyenduser=parseInt(App.qty);
  var totalprice=shoppingCart.totalCart();
  //console.log(totalprice);
  //window.alert(totalprice)
  $("#totalamountforcreditcard").append(totalprice);
  $("#categorypage").hide();
  $("#productpage").hide();
  $("#paymentpage").show();
  $("#categorypagetwo").hide();
  $("#categorytwopagemain").hide();
  $("#enduserorder").hide();
  }
},
completepaymentbyEndUser : async()=>{
  //window.alert("buying ny end user");
      //await App.loadWeb3();
     // if(parseInt(App.puchasethroughcart)==1){
        //reached here through add to cart 
            // var cart = document.getElementsByClassName('js-cd-cart');
            // if(cart.length > 0) {
            //   var cartAddBtns = document.getElementsByClassName('js-cd-add-to-cart'),
            //   cartBody = cart[0].getElementsByClassName('cd-cart__body')[0],
            //   cartList = cartBody.getElementsByTagName('ul')[0],
            //   cartListItems = cartList.getElementsByClassName('cd-cart__product'),
            //   cartTotal = cart[0].getElementsByClassName('cd-cart__checkout')[0].getElementsByTagName('span')[0],
            //   cartCount = cart[0].getElementsByClassName('cd-cart__count')[0],
            //   cartCountItems = cartCount.getElementsByTagName('li'),
            //   cartUndo = cart[0].getElementsByClassName('cd-cart__undo')[0];
            // }
            // var products = cartList.getElementsByClassName('cd-cart__body');
            
            //console.log(cartListItems);
            var total_amount=0;
            var cartArray = shoppingCart.listCart();
            for(var i = 0; i < cartArray.length; i++) {         
                var Quantity = cartArray[i].count;
                console.log("quantiy="+Quantity);            
               var  price1 =cartArray[i].price;
               console.log("price="+price1);       
               var  medicineId =cartArray[i].id;
               console.log("Medicine Id="+medicineId); 
                var medicine=await App.medicine.medicineforendusers(parseInt(medicineId)); 
                var inputqty=parseInt(Quantity)  
                var price=parseInt(price1) ;
                
                var available_Qty=parseInt(medicine[4]);
                console.log(available_Qty);
                if(inputqty>available_Qty){
                  window.alert("Quatity Not Avilable To Buy");
                }
                else{
                  window.alert("Transaction for amount= "+inputqty*price);
                  total_amount+=inputqty*price;
                   await App.loadWeb3();
                  await App.loadAccount();
                   await App.loadContract();

                  console.log(App.account);
                   await App.medicine.buyMedicineByEndUser(parseInt(medicineId),inputqty, { from: App.account })
                    window.alert("Completed successfully. Thanks for the order");
                    shoppingCart.clearCart();
                    await App.render();
                 
                            
                 
                 

                } 
            }
           

      // }
      // else{
      //   //reached here through quick view and purchase
      //   var medicine=await App.medicine.medicineforendusers(parseInt(App.medicineforendusersID));       
      //   var availableqty=medicine[4];
      //   if(parseInt(App.qtyselectedbyenduser)>parseInt(availableqty)){
      //     window.alert("Quantiy Not Available")
      //   }
      //   else{
      //     //await App.loadAccount();
      //     await App.medicine.buyMedicineByEndUser(parseInt(App.medicineforendusersID),parseInt(App.qtyselectedbyenduser),{from:App.account})       
      //   }
      // }
     
 
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


      var user=await App.medicine.users(App.account);
      console.log(user);
      var role=user.role;
      var approved=user.approved;
      console.log("role="+role);      
      var username=user.name;

    
      if(role=="1"){
        //End User
        //window.alert("role="+role)
        window.location.replace('/category.html');
      }
      // else if(role=="2"){
      //   //C.A
      // }
      else if(approved.localeCompare("false")==0){
        alert("Waiting for approval from admin");
        return
      }else if(approved.localeCompare("reject")==0){
        alert("Sorry, you cannot login to our website");
        return

      }
        if(role=="3"){
          //Distributor
          window.location.replace('Distributor/index.html');
          }
        
        else if(role=="4"){
          // crudOperation.show();
          //Manufacturer
          window.location.replace('Manufacturer/index.html'); 
        }
        else{

         
          admin=await App.medicine.admin();       
          if(admin.toUpperCase().localeCompare(App.account.toUpperCase())==0){
            window.location.replace('Admin/index.html');
            
          }
          else{
            //New User
            //New User

           
             // home.hide();
              window.location.replace('./Register.html');

              
              // register.show();
             
          }
          
        }
  
      App.setLoading(false)
    },

    viewMyOrdersPageEndUSer :async () =>{
      //window.alert(App.medicineIdforendUserBuy);
      $("#enduserorders").empty();
      var orderStatusCountEndUser=await App.medicine.orderStatusCountEndUser();
      await App.loadWeb3();
        await App.loadAccount();
        await App.loadContract();
        var user=await App.medicine.users(App.account);
        var username=user.name;
        console.log(username);
      
      for(var i=1;i<=orderStatusCountEndUser;i++){
        var order=await App.medicine.orderstatusesofenderusers(parseInt(i));
        var enduseraddr=order.enduser;
        console.log(enduseraddr+"--"+App.account);
        if(enduseraddr.toUpperCase().localeCompare(App.account.toUpperCase())==0){
          //order founnd
          console.log("enter if");
          var medid=parseInt(order.medid);
          var medicine=await App.medicine.medicines(medid);
          var medname=medicine.medname;
          var distributer=order.distributer;
          var user=await App.medicine.users(distributer);
          var username=user.name;
          var qty=order.qty;
          var status=order.status;
          var str="";
          if(status=="0"){
             str="<tr><td>"+i+"</td><td>"+medname+"</td><td>"+username+"</td><td>"+qty+"</td></tr>";                
          }
          if(status=="1"){
            //purchased by distributer Need to accept
             str="<tr><td>"+i+"</td><td>"+medname+"</td><td>"+username+"</td><td>"+qty+"</td><td>Waiting for order Accepted</td></tr>"; 
           
          }
          if(status=="2"){
            //Accepted the order Need to ship
            str="<tr><td>"+i+"</td><td>"+medname+"</td><td>"+username+"</td><td>"+qty+"</td><td>Order Accepted.Waiting for Shipping</td></tr>"; 
           
          }
          if(status=="3"){
            //Product Shipped MArk as wating for Delivery confirmation
           str="<tr><td>"+i+"</td><td>"+medname+"</td><td>"+username+"</td><td>"+qty+"</td><td>Shipped</td><td><button class='btn btn-info' onclick='App.markSatusAsCompletedEndUser(`"+i+"`)'>Mark as Delivered</button></td></tr>"; 
           
          }
          if(status=="4"){
            //Product Shipped MArk as wating for Delivery confirmation
           str="<tr><td>"+i+"</td><td>"+medname+"</td><td>"+username+"</td><td>"+qty+"</td><td>Order Delivered</td></tr>"; 
           
          }
          if(status=="5"){
            //Product Delivered by the Distributer
           str="<tr><td>"+i+"</td><td>"+medname+"</td><td>"+username+"</td><td>"+qty+"</td><td>Order Delivered</td></tr>";            
          }   
         
          $("#enduserorders").append(str);
        }
      }
     
      $("#categorypage").hide();
      $("#productpage").hide();
      $("#paymentpage").hide();
      $("#categorypagetwo").hide();
      $("#categorytwopagemain").hide();
      $("#enduserorder").show();
      $("#endusername").append(username);
    },

    markSatusAsCompletedEndUser :async (id)=>{
      await App.medicine.updateOrderStatusEndUser(parseInt(id),"5",{from:App.account});
      await App.render();
    },
    viewCertificate:async (name)=>{
      var certificateAddress='';
      console.log(name);

      if(name.trim().toLowerCase().localeCompare("dolonex disp 20mg tabs")==0 || name.trim().toLowerCase().localeCompare("disp 20mg tabs")==0){
        certificateAddress="0x089f03b202470b872b7e2c84c7a6815033382140";
      }else if(name.trim().toLowerCase().localeCompare("aspirin")==0 || name.trim().toLowerCase().localeCompare("aspirin 500 mg tabs")==0){
        certificateAddress="0x4C21bb8b30DBd4aFBC7Ea0e4F52a0aF90c50082C";
        console.log(certificateAddress);
      }else if(name.trim().toLowerCase().localeCompare("atpark 25mg")==0 || name.trim().toLowerCase().localeCompare("atpark")==0){
        certificateAddress ="0x0AB8F188F7F950e91c6dB8f745B124A15B0B5d5F";
      }else if(name.trim().toLowerCase().localeCompare("januvia")==0){
        certificateAddress="0x7A4D996385985A39a245786aB7524C1a9ca0fE98";
      }else{
        certificateAddress="0x2fcd5be391Beb9Ce874b117fD3D50cCBA172C2bB";
      }

      //certificateAddress= "0x089f03b202470b872b7e2c84c7a6815033382140";
      var baseURL = "https://app.certificateok.de/api/certificate/";
      var certOk = "https://www.certificateok.de/wp-content/uploads/2016/04/certificate_ok_black_Zeichenfläche-1.png";
    
      $.ajax({
    
          url: baseURL + certificateAddress,
          method:"GET"
      
        }).done(function(data){
           $('#viewCert').empty();

          document.getElementById("logoProp").src = `${certOk}`;

          var jsonData = '';
          if(data.valid)
          
            jsonData=`<table class='tableCert table-borderless' width='100%' cellspacing='0'><colgroup><col span="1" style="width: 40%;"><col span="1" style="width: 60%;"></colgroup><tr><th>Holder of Certificate:</th><td>${data.holder}</td></tr><tr><th>Certification Mark:</th><td><img alt="" src="${data.cbLogo}" height="100" width="100"></td></tr><tr><th>Certificate Number:</th><td>${data.number}</td></tr><tr><th>Product Name:</th><td>${data.model}</td></tr><tr><th>Product Category:</th><td>${data.product}</td></tr><tr><th>Standards:</th><td>${data.standard}</td></tr><tr><th>Issued Date:</th><td>${data.issued}</td></tr><tr><th>Expired Date:</th><td>${data.expired}</td></tr><tr><th>Valid:</th><td><i class="fa fa-check-circle fa-2x" style="color:green;"></i></i></td></tr> </table>`;

          else
            jsonData=`<table class='tableCert table-borderless' width='100%' cellspacing='0'><colgroup><col span="1" style="width: 40%;"><col span="1" style="width: 60%;"></colgroup><tr><th>Holder of Certificate:</th><td>${data.holder}</td></tr><tr><th>Certification Mark:</th><td><img alt="" src="${data.cbLogo}" height="100" width="100"></td></tr><tr><th>Certificate Number:</th><td>${data.number}</td></tr><tr><th>Product Name:</th><td>${data.model}</td></tr><tr><th>Product Category:</th><td>${data.product}</td></tr><tr><th>Standards:</th><td>${data.standard}</td></tr><tr><th>Issued Date:</th><td>${data.issued}</td></tr><tr><th>Expired Date:</th><td>${data.expired}</td></tr><tr><th>Valid:</th><td><i class="fa fa-times-circle fa-2x" style="color:red;"></i></i></td></tr> </table>`;
             
          $("#viewCert").append(jsonData);

        }).fail(function(err){
          console.log({err});
    });
    
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

  showCard:async(elem)=>{
    console.log("clicked");
    var medicine=await App.medicine.medicineforendusers(parseInt($(elem).data('id')));

    var available_Qty=parseInt(medicine[4]);
    console.log(available_Qty);

    if(available_Qty!=0){
  var name = $(elem).data('name');
  var price = Number($(elem).data('price'));
  var id = Number($(elem).data('id'));

  shoppingCart.addItemToCart(name, price,id, 1);
  displayCart();
}
  }

}
$(function () {
  $(window).load(function () {
       App.loadHome();
       //App.load();
  })
});

$(function () {
  $(window).load(function () {      
       App.showAllMedicines();
       //App.load();
  })
});

function clicked(item) {
  console.log($(item).attr("id"));

  localStorage.setItem("categoryName",$(item).attr("id"));

  //window.location.replace('./category.html');
  $("a").prop("href", "./category.html");


 }

function loginClick(){
  //alert("MetaMask Connection clicked");
  App.load();
}

$(document).ready(function () {
  $("input[type='radio']").on("change", function(){        
      changedbyPrice(this);
  });
});

function changedbyPrice(obj) {
  App.displayData=1;
  if (obj.id == "flexRadioDefault1") {
    App.minPrice=1;
    App.maxPrice=100;
  }
  else if (obj.id == "flexRadioDefault2")
  {
    App.minPrice=1;
    App.maxPrice=20;
  }else if (obj.id == "flexRadioDefault3")
  {
    App.minPrice=20;
    App.maxPrice=50;
  }else if (obj.id == "flexRadioDefault4")
  {
    App.minPrice=50;
    App.maxPrice=100;
  }

 App.loadHome();
}

var shoppingCart = (function() {
  // =============================
  // Private methods and propeties
  // =============================
  cart = [];
  
  // Constructor
  function Item(name, price,id, count) {
    this.name = name;
    this.price = price;
    this.id=id;
    this.count = count;
  }
  
  // Save cart
  function saveCart() {
    sessionStorage.setItem('shoppingCart', JSON.stringify(cart));
  }
  
    // Load cart
  function loadCart() {
    cart = JSON.parse(sessionStorage.getItem('shoppingCart'));
  }
  if (sessionStorage.getItem("shoppingCart") != null) {
    loadCart();
  }
  

  // =============================
  // Public methods and propeties
  // =============================
  var obj = {};
  
  // Add to cart
  obj.addItemToCart = function(name, price,id, count) {
    console.log("item added in to cart");
    for(var item in cart) {
      if(cart[item].name === name) {
        console.log(App.quantity+"--"+cart[item].count);
        if(cart[item].count<App.quantity){
          cart[item].count ++;
          saveCart();
          return;
        }else{
          alert("No more items available");
        return;
      }
          
        
      }
    }
    var item = new Item(name, price, id, count);
    cart.push(item);
    saveCart();
  }
  // Set count from item
  obj.setCountForItem = function(name, count) {
    for(var i in cart) {
      if (cart[i].name === name) {
        cart[i].count = count;
        break;
      }
    }
  };
  // Remove item from cart
  obj.removeItemFromCart = function(name) {
      for(var item in cart) {
        if(cart[item].name === name) {
          cart[item].count --;
          if(cart[item].count === 0) {
            cart.splice(item, 1);
          }
          break;
        }
    }
    saveCart();
  }

  // Remove all items from cart
  obj.removeItemFromCartAll = function(name) {
    for(var item in cart) {
      if(cart[item].name === name) {
        cart.splice(item, 1);
        break;
      }
    }
    saveCart();
  }

  // Clear cart
  obj.clearCart = function() {
    cart = [];
    saveCart();
  }

  // Count cart 
  obj.totalCount = function() {
    var totalCount = 0;
    for(var item in cart) {
      totalCount += cart[item].count;
    }
    return totalCount;
  }

  // Total cart
  obj.totalCart = function() {
    var totalCart = 0;
    for(var item in cart) {
      totalCart += cart[item].price * cart[item].count;
    }
    return Number(totalCart.toFixed(2));
  }

  // List cart
  obj.listCart = function() {
    var cartCopy = [];
    for(i in cart) {
      item = cart[i];
      itemCopy = {};
      for(p in item) {
        itemCopy[p] = item[p];

      }
      itemCopy.total = Number(item.price * item.count).toFixed(2);
      cartCopy.push(itemCopy)
    }
    return cartCopy;
  }

  return obj;
})();


// *****************************************
// Triggers / Events
// ***************************************** 
// Add item
$('.add-to-cart').click(function(event) {
  event.preventDefault();
  var name = $(this).data('name');
  var price = Number($(this).data('price'));
  var id = Number($(this).data('id'));
  shoppingCart.addItemToCart(name, price, id, 1);
  displayCart();
});

// Clear items
$('.clear-cart').click(function() {
  shoppingCart.clearCart();
  displayCart();
});


function displayCart() {
  var cartArray = shoppingCart.listCart();
  var output = "";
  for(var i in cartArray) {
    output += "<tr>"
      + "<td>" + cartArray[i].name + "</td>" 
      + "<td>(" + cartArray[i].price + ")</td>"
      + "<td><div class='input-group'><button class='minus-item input-group-addon btn btn-primary' data-name=" + cartArray[i].name + ">-</button>"
      + "<input type='number' class='item-count form-control' data-name='" + cartArray[i].name + "' value='" + cartArray[i].count + "'>"
      + "<button class='plus-item btn btn-primary input-group-addon' data-name=" + cartArray[i].name + ">+</button></div></td>"
      + "<td><button class='delete-item btn btn-danger' data-name=" + cartArray[i].name + ">X</button></td>"
      + " = " 
      + "<td>" + cartArray[i].total + "</td>" 
      +  "</tr>";
  }
  $('.show-cart').html(output);
  $('.total-cart').html(shoppingCart.totalCart());
  $('.total-count').html(shoppingCart.totalCount());
}

// Delete item button

$('.show-cart').on("click", ".delete-item", function(event) {
  var name = $(this).data('name')
  shoppingCart.removeItemFromCartAll(name);
  displayCart();
})


// -1
$('.show-cart').on("click", ".minus-item", function(event) {
  var name = $(this).data('name')
  shoppingCart.removeItemFromCart(name);
  displayCart();
})
// +1
$('.show-cart').on("click", ".plus-item", function(event) {
  var name = $(this).data('name')
  shoppingCart.addItemToCart(name);
  displayCart();
})

// Item count input
$('.show-cart').on("change", ".item-count", function(event) {
   var name = $(this).data('name');
   var count = Number($(this).val());
  shoppingCart.setCountForItem(name, count);
  displayCart();
});

displayCart();