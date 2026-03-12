// Products load from backend API

fetch("http://localhost:5000/products")
.then(response => response.json())
.then(products => {

let container = document.getElementById("productsContainer")

let html = ""

products.forEach(product => {

html += `

<div class="product">

<img src="${product.image}" alt="${product.name}">

<h3>${product.name}</h3>

<p>₹${product.price}</p>

<button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
Add to Cart
</button>

<div class="review">

<input type="text" placeholder="Your Name">

<select>
<option>5</option>
<option>4</option>
<option>3</option>
<option>2</option>
<option>1</option>
</select>

<input type="text" placeholder="Write Review">

<button>Submit</button>

</div>

</div>

`

})

container.innerHTML = html

})


// Cart system

function addToCart(id, name, price){

let cart = JSON.parse(localStorage.getItem("cart")) || []

cart.push({
id:id,
name:name,
price:price,
qty:1
})

localStorage.setItem("cart", JSON.stringify(cart))

alert("Added to cart 🛒")

}

function searchProducts(){

let input = document.getElementById("searchBox").value.toLowerCase()

let products = document.querySelectorAll(".product")

products.forEach(p=>{

let name = p.querySelector("h3").innerText.toLowerCase()

if(name.includes(input)){
p.style.display="block"
}else{
p.style.display="none"
}

})

}
function filterCategory(category){

let products = document.querySelectorAll(".product")

products.forEach(p=>{

let cat = p.getAttribute("data-category")

if(category=="all" || cat==category){
p.style.display="block"
}else{
p.style.display="none"
}

})

}
function addReview(){

let name = document.getElementById("reviewName").value
let rating = document.getElementById("rating").value
let comment = document.getElementById("comment").value

fetch("http://localhost:5000/add-review",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
product_id:1,
name:name,
rating:rating,
comment:comment
})

})
.then(res=>res.text())
.then(data=>{

alert("Review Submitted")

})

}