import React, { useState, } from 'react';
import TopAppBar from './AppBarComponent';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DishDetailDialog from './DishDetailDialog';
import { restaurants } from '../Firebase/firebase'
import firebase from "firebase";

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    icon: {
        color: 'rgba(255, 255, 255, 0.54)',
    },
}));


var dic = new Map();

const Menu = (props) => {
    const classes = useStyles();
    const [detailOpen, setDetailOpen] = useState(null);
    const [detailDish, setDetailDish] = useState(null);
    const [addAlert, setAddAlert] = useState(false);

    function handleAddButton(dishRef, tableID) {
        const increment = firebase.firestore.FieldValue.increment(1);

        if (dic.has(dishRef)) {
            console.log("hoho");
            var gt = dic.get(dishRef);
            const st = restaurants.doc(props.restaurant).collection("tables").doc(tableID).collection("cart").doc(gt);
            restaurants.doc(props.restaurant).collection("tables").doc(tableID).collection("cart").doc(gt).get().then(function (doc) {
                if (doc.exists) {
                    // console.log("Document data:", doc.data());
                    st.update({ number: increment });
                } else {
                    // doc.data() will be undefined in this case
                    const fa = String(Math.random());
                    restaurants.doc(props.restaurant).collection('tables').doc(tableID).collection('cart').doc(fa)
                        .set({
                            dishRef,
                            number: 1,
                        })
                    dic.set(dishRef, fa);
                }
            }).catch(function (error) {
                console.log("Error getting document:", error);
            });
        } else {
            console.log("haha");
            const fa = String(Math.random());
            restaurants.doc(props.restaurant).collection('tables').doc(tableID).collection('cart').doc(fa)
                .set({
                    dishRef,
                    number: 1,
                })
            dic.set(dishRef, fa);
        }
    }

    // function handleAddButton(dishRef, tableID) {
    //     if (props.restaurant !== "[restaurant_name]" && dishRef != null && tableID != null && String(tableID).charAt(0) === 't') {
    //         restaurants.doc(props.restaurant).collection('tables').doc(tableID).collection('cart')
    //             .add({
    //                 dishRef,
    //                 number: 1,
    //             }
    //             ).then(ref => {
    //                 console.log('Added document with ID: ', ref.id);
    //                 setAddAlert(true);
    //             });
    //     } else {
    //         console.log("dishRef: ", dishRef, ", tableID: ", tableID)
    //     }
    // }


    function filterMenuByCategory(menu, currentCategory) {
        currentCategory = String(currentCategory);
        var MenuAfterfiltered = [];
        var menu = Array.from(menu).filter(dish => dish.availability === true);
        var k = String(currentCategory).charAt(0);
        console.log(k);

        if (currentCategory.charAt(0) != "#") {
            for (var dish of menu) {
                for (var category of Array.from(dish.categories)) {
                    if (String(category).toLowerCase() == String(currentCategory).toLowerCase()) {
                        MenuAfterfiltered.push(dish)
                        break;
                    }
                }
            }
        } else {
            var w = String(currentCategory).substring(1);
            // console.log(JSON.stringify(w));
            for (var dish of menu) {
                var pos = String(dish.name).toLowerCase().search(String(w).toLowerCase());
                if (pos !== -1) {
                    MenuAfterfiltered.push(dish)
                }
            };
            // setAddAlert(false);
        }
        // console.log(MenuAfterfiltered);
        return MenuAfterfiltered;
    }
    const RenderDishDetail = (dishRef) => {
        setDetailOpen(Math.random());
        setDetailDish(dishRef);
    };
    // console.log("aaa", props);
    return (

        <div >
            <TopAppBar restaurant={props.restaurant} table={props.table} />
            <div className={classes.root}>
                <GridList cellHeight={150} className={classes.gridList}>
                    <GridListTile key="Subheader" cols={2} style={{ height: 'auto' }}>
                        <ListSubheader component="div">Category/Search words: {props.currentCategory}</ListSubheader>
                    </GridListTile>
                    {filterMenuByCategory(props.menu, props.currentCategory, true)
                        .map(dish => (
                            <GridListTile key={dish.id}>
                                <img
                                    src={dish.image !== "" ? dish.image : "https://firebasestorage.googleapis.com/v0/b/qr-code-ordering-system.appspot.com/o/koisushiMenu%2Fdefault-food-image.jpg?alt=media&token=e6958bef-eae1-4144-b670-e717768d518f"}
                                    alt={dish.name}
                                    onClick={() => RenderDishDetail(dish)}
                                />
                                <GridListTileBar
                                    title={dish.name}
                                    subtitle={<span>${dish.price}</span>}
                                    actionIcon={
                                        <IconButton
                                            onClick={() => handleAddButton(dish, props.table)}
                                            aria-label={`info about ${dish.name}`}
                                            className={classes.icon}
                                        >
                                            <AddShoppingCartIcon />
                                        </IconButton>
                                    }
                                />
                            </GridListTile>
                        ))}
                </GridList>
                <DishDetailDialog open={detailOpen} dish={detailDish} restaurant={props.restaurant} table={props.table} />
            </div>

            <div>
                <Dialog
                    open={addAlert}
                    onClose={() => { setAddAlert(false) }}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Succesfully add to cart!
                                </DialogContentText>
                    </DialogContent>

                </Dialog>
            </div>
        </div>
    );

}

export default Menu;