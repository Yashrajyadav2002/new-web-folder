let FatchData=async()=>{
    let url ='http://localhost:3000/carrent'
    let res = await fetch(url,{method:"GET"})

    let data = await res.json()

    DataShow(data)
}


let search= async()=>{
    let searchpage = document.querySelector("#searchpage").value.toLowerCase()

    let url = 'http://localhost:3000/carrent'

    let res= await fetch(url)
    let data= await res.json()

    let FilterData= data.filter((e)=>{
        return e.carType.toLowerCase().includes(searchpage)
    })
    DataShow(FilterData)

}
    let DataShow=(data)=>{
    let show= document.querySelector("#display");
    show.innerHTML=""
    data.map((e)=>(
        show.innerHTML+=
        `<tr>
           <td>${e.carType}</td>
           <td>${e.pickupLocation}</td>
           <td>${e.pickupDate}</td>
           <td>${e.returnDate}</td>
           <td>${e.fullName}</td>
           <td>${e.email}</td>
           <td><button onclick="formopen('${e.id}')">Edit</button></td>
           <td> <button onclick="del('${e.id}')">delete</button></td>
        </tr>`
    )

    
)}
// let confirm=(id)=>{

//     Swal.fire({

//         title:"Are you sure",
//         text:"You wont't be able to revert this",
//         icon:"Warning",
//         shwcancelButton: true,
//         confirmButtonColor:"#3005d6",
//         cancelButtonColor:"#d33",
//         confirmbuttonText:"yes,delete it!"
//     }).than((result)=>{
//         if(result.isconfirmed){
//             Del(id)
//             Swal.fire({
//                 title: "Deleted",
//                 text: "Your faile has been deteted",
//                 icon: "Success"
//             });
//         }
//     });
// }

let del=(id)=>{
    fetch(`http://localhost:3000/carrent/${id}`,{method:"DELETE"})
}

FatchData();

let ins=()=>{

    let carType=document.querySelector("#carType").value
    let pickupLocation=document.querySelector("#pickupLocation").value
    let pickupDate=document.querySelector("#pickupDate").value
    let returnDate=document.querySelector("#returnDate").value
    let fullName=document.querySelector("#name").value
    let email=document.querySelector("#email").value


    let url='http://localhost:3000/carrent'

    fetch(url ,{
        method:"POST",
        headers:{
            "content-type":"application/json"
        },

        body: JSON.stringify(
            {
               carType:carType,
               pickupLocation:pickupLocation,
               pickupDate:pickupDate,
               returnDate:returnDate,
               fullName:fullName,
               email:email
              

            }

        )
    })


    location.href="index.html"
    return false

};

let formopen=async(id)=>{
  let url=`http://localhost:3000/carrent/${id}`;
  let res=await fetch(url);
  let data=await res.json();

  let FormData= `
  Enter carType: <input type="text" id="upcarType" value="${data.carType}"> <br> <br>
  Enter pickupLocation: <input type="text" id="uppickupLocation" value="${data.pickupLocation}"> <br> <br>
  Enter pickupDate: <input type="date" id="uppickupDate" value="${data.pickupDate}"> <br> <br>
  Enter returnDate: <input type="date" id="upreturnDate" value="${data.returnDate}"> <br> <br>
  Enter fullName: <input type="text" id="upfullName" value="${data.fullName}"> <br> <br>
  Enter email: <input type="email" id="upemail" value="${data.email}"> <br> <br>

  <input type="submit" onclick="return UpdateForm('${data.id}')" value="Edit">
`
  document.querySelector("#formshow").innerHTML=FormData
}


let updateForm=(id)=>{
    
    let carType=document.querySelector("#upcarType").value
    let pickupLocation=document.querySelector("#uppickupLocation").value
    let pickupDate=document.querySelector("#uppickupDate").value
    let returnDate=document.querySelector("#upreturnDate").value
    let fullName=document.querySelector("#upname").value
    let email=document.querySelector("#upemail").value

    let url=`http://localhost:3000/carrent/${id}`

    fetch(url ,{
        method:"PUT",
        headers:{
            "content-type":"application/json"
        },
        body: JSON.stringify(
            {
                carType:carType,
                pickupLocation:pickupLocation,
                pickupDate:pickupDate,
                returnDate:returnDate,
                fullName:fullName,
                email:email
            }
        )
    })

    // location.href="orderpage.html"
    return false;
}



