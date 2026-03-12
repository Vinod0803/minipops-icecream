const express = require("express")
const mysql = require("mysql")
const cors = require("cors")
const multer = require("multer")

const app = express()

app.use(cors())
app.use(express.json())

// MySQL Connection
const db = mysql.createConnection({
host: "localhost",
user: "root",
password: "Vinnu0313@",
database: "vinnudb"
})
const storage = multer.diskStorage({

destination:function(req,file,cb){
cb(null,"uploads/")
},

filename:function(req,file,cb){
cb(null,Date.now()+"-"+file.originalname)
}

})

const upload = multer({storage:storage})

db.connect((err)=>{
if(err){
console.log("Database error:",err);
}else{
console.log("MySQL Connected");
}
})


// Get Products API
app.get("/products",(req,res)=>{

const sql = "SELECT * FROM products"

db.query(sql,(err,result)=>{
if(err) throw err
res.json(result)
})

})
app.post("/add-product",(req,res)=>{

let {name,price,image,stock} = req.body

const sql =
"INSERT INTO products (name,price,image,stock) VALUES (?,?,?,?)"

db.query(sql,[name,price,image,stock],(err,result)=>{

if(err) throw err

res.send("Product Added")

})

})
app.delete("/delete-product/:id",(req,res)=>{

let id = req.params.id

const sql = "DELETE FROM products WHERE id=?"

db.query(sql,[id],(err,result)=>{

if(err) throw err

res.send("Product Deleted")

})

})
app.put("/update-product/:id",(req,res)=>{

let id = req.params.id
let {name,price,image,stock} = req.body

const sql =
"UPDATE products SET name=?,price=?,image=?,stock=? WHERE id=?"

db.query(sql,[name,price,image,stock,id],(err,result)=>{

if(err) throw err

res.send("Product Updated")

})

})

// Place Order API
app.post("/order",(req,res)=>{

let {name, phone, address, total, items} = req.body

const customerSQL =
"INSERT INTO customers (name, phone, address) VALUES (?,?,?)"

db.query(customerSQL,[name,phone,address],(err,result)=>{

let customer_id = result.insertId

const orderSQL =
"INSERT INTO orders (customer_id,total,status) VALUES (?,?,?)"

db.query(orderSQL,[customer_id,total,"Pending"],(err,orderResult)=>{

let order_id = orderResult.insertId

items.forEach(item=>{

// Save order items
db.query(
"INSERT INTO order_items (order_id,product_id,quantity) VALUES (?,?,?)",
[order_id,item.id,item.qty]
)

// Reduce stock
db.query(
"UPDATE products SET stock = stock - ? WHERE id=?",
[item.qty,item.id]
)

})

res.send("Order placed")

})

})

})
app.post("/upload",upload.single("image"),(req,res)=>{

res.json({
image:"uploads/"+req.file.filename
})

})
app.get("/orders",(req,res)=>{

const sql = `
SELECT orders.id, customers.name, customers.phone, customers.address, orders.total, orders.status
FROM orders
JOIN customers ON orders.customer_id = customers.id
`

db.query(sql,(err,result)=>{

if(err) throw err

res.json(result)

})

})
app.get("/orders-by-phone/:phone",(req,res)=>{

let phone = req.params.phone

const sql = `
SELECT orders.id, orders.total, orders.status
FROM orders
JOIN customers ON orders.customer_id = customers.id
WHERE customers.phone=?
`

db.query(sql,[phone],(err,result)=>{

if(err) throw err

res.json(result)

})

})
app.get("/analytics",(req,res)=>{

const analytics = {}

db.query("SELECT COUNT(*) AS totalOrders FROM orders",(err,result)=>{

analytics.orders = result[0].totalOrders

db.query("SELECT SUM(total) AS revenue FROM orders",(err,result)=>{

analytics.revenue = result[0].revenue || 0

db.query("SELECT COUNT(*) AS products FROM products",(err,result)=>{

analytics.products = result[0].products

res.json(analytics)

})

})

})

})

app.get("/daily-sales",(req,res)=>{

const sql = `
SELECT COUNT(*) AS orders, SUM(total) AS revenue
FROM orders
WHERE DATE(created_at) = CURDATE()
`

db.query(sql,(err,result)=>{

if(err) throw err

res.json(result[0])

})

})

app.put("/update-order/:id",(req,res)=>{

let id = req.params.id
let {status} = req.body

const sql = "UPDATE orders SET status=? WHERE id=?"

db.query(sql,[status,id],(err,result)=>{

if(err) throw err

res.send("Order Updated")

})

})

app.post("/add-review",(req,res)=>{

let {product_id,name,rating,comment} = req.body

const sql =
"INSERT INTO reviews (product_id,name,rating,comment) VALUES (?,?,?,?)"

db.query(sql,[product_id,name,rating,comment],(err,result)=>{

if(err) throw err

res.send("Review Added")

})

})

app.post("/register",(req,res)=>{

let {name,email,password} = req.body

const sql =
"INSERT INTO users (name,email,password) VALUES (?,?,?)"

db.query(sql,[name,email,password],(err,result)=>{

if(err) throw err

res.send("User Registered")

})

})

app.post("/login",(req,res)=>{

let {email,password} = req.body

const sql =
"SELECT * FROM users WHERE email=? AND password=?"

db.query(sql,[email,password],(err,result)=>{

if(result.length>0){
res.json(result[0])
}else{
res.send("Invalid Login")
}

})

})
// Start Server
app.listen(5000,()=>{
console.log("Server running on http://localhost:5000")
})
