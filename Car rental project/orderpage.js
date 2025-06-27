let FatchData=async()=>{
    let url ='http://localhost:3000/carrent'
    let res = await fetch(url,{method:"GET"})

    let data = await res.json()

    DataShow(data)
}


let search= async()=>{
    let searchinp = document.querySelector("#searchinp").value.toLowerCase()

    let url = 'http://localhost:3000/carrent'

    let res= await fetch(url)
    let data= await res.json()

    let FilterData= data.filter((e)=>{
        return e.name.toLowerCase().includes(searchinp)
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
           <td><button onclick="formopen(${e.id})">Edit</button></td>
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

