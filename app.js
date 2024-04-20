const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();



app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));


app.set('view engine', "ejs");


mongoose.connect("mongodb+srv://admin-step:Kyanoboy200412@cluster0.wfttukb.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist"
})

const item2 = new Item({
    name: "Hit the + button to add a new item."
})

const item3 = new Item({
    name: "<--Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];


const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model('List', listSchema);



app.get("/", (req, res) => {



    Item.find({}, { _id: 0, __v: 0 })

    .then((result) => {
        if (result.length === 0) {
            Item.insertMany(defaultItems)
            .then(() => {
                console.log("Items inserted");
            })
            .catch((err) => {
                console.log(err);
            });
        } else {
            res.render("list", {listTitle: "Today", newListItems: result})
        }
    })
 })



app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    let item = new Item({
        name: itemName
    })

    if (listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name : listName})
        .then((list) => {
            list.items.push(item);
            list.save();
            res.redirect("/" + list.name);
        })
    }
})


app.post("/delete", (req, res) => {
    const checkedItemName = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
        Item.deleteOne({ name: checkedItemName })
    .then(() => {
        console.log("Item deleted successfully");
        res.redirect("/"); 
    })
    .catch((err) => {
        console.log("Error deleting item:", err);
        res.status(500).send("Error deleting item");
    });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {name: checkedItemName}}})
        .then((list) =>{
            res.redirect("/" + list.name);
        })
        .catch((err) => {
            console.log("Error deleting item:", err);
            res.status(500).send("Error deleting item");
        });
    }
    


});

app.get("/:customListName", (req, res) => {
    const customListName = lodash.capitalize(req.params.customListName);
    List.findOne({ name: customListName })
    .then((list) => {
        if (!list) {

            const list = new List({
                name: customListName,
                items: defaultItems
            })

            list.save();
            res.redirect("/" + customListName);
        } else {
            res.render("list", {listTitle: list.name, newListItems: list.items})
        }
    })
    .catch((err) => {
        console.error("Error:", err);
    });
    
})
app.post("/work", (req, res) => {
    let input = req.body.newItem
    workItems.push(input);
    res.redirect("/work")
})

app.get("/about", (req, res) => {
    res.render("about");
})

app.listen(3000, function(){
    console.log("Server is running on port 3000");
})



// List.deleteMany({
//     name: {
//         $in: [
//             "home"
//         ]
//     }
// })
// .then(result => {
//     console.log("Successfully deleted")
// })
// .catch(err => {
//     console.log("failed Deletion");
// })