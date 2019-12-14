import React, { Component } from 'react';
import {
  ScrollView,
  // Button, 
  CheckBox, Dimensions, StyleSheet, SafeAreaView, FlatList, View, Text, Image, TouchableOpacity, Modal
} from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
// import { koiSushiMenu, koiSushiRestaurant } from '../config';
import Dish from '../components/Dish';
import { Button, Paragraph, Dialog, Portal } from 'react-native-paper';
import { Checkbox } from 'react-native-paper';
import { TextInput } from 'react-native-paper';
import { loggedUser } from './Login';


var MenuRef;

export default class Menu extends Component {
  constructor(props) {
    super(props);
    MenuRef = firebase.firestore().collection(String(loggedUser.displayName) + "Menu")
  }
  fetchCategories = () => {
    firebase.firestore().collection("restaurants").doc(String(loggedUser.displayName))
      .get()
      .then(
        (doc) => {
          this.setState({ restauCatogories: doc.data().categories });
          // console.log("aaa", this.state.restauCatogories)
        });
  }

  getCurIndex = () => {
    firebase.firestore().collection("restaurants").doc(String(loggedUser.displayName))
      .get()
      .then(
        (doc) => {
          this.setState({ currentIndex: doc.data().index });
        });
  }

  componentDidMount() {
    this.getCurIndex();
    this.getAllID();
    this.fetchCategories()
  }

  state = {
    currentIndex: 0, DATA: [],
    newCategory: null,
    categoryDialogOpen: false,
    DATA: [],
    restauCatogories: []
  };

  hideCategoryDialog = () => {
    this.setState({ categoryDialogOpen: false })
  }

  createNew = () => {
    MenuRef.doc(this.state.currentIndex.toString())
      .set({
        image: "", name: this.state.currentIndex.toString(), price: 0, categories: ["All"], description: "",
        id: this.state.currentIndex.toString(), availability: true, newPrice: 0
      })
      .then(
        firebase.firestore().collection("restaurants").doc(String(loggedUser.displayName))
          .update({ index: this.state.currentIndex + 1 })
      ).then(
        this.setState({ currentIndex: (this.state.currentIndex + 1) })
      );

    this.getAllID();
  }

  deleteDish = (DishId) => {
    MenuRef.doc(DishId).delete();
    this.getAllID();
  }

  getAllID = () => {
    const list = [];
    MenuRef
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach((doc) => {
          list.push(Number(doc.id));
        })
        this.setState({ DATA: list.sort((a, b) => a - b) })
      })
  }

  addCategory = () => {
    if (this.state.newCategory != null) {
      // koiSushiRestaurant
      firebase.firestore().collection("restaurants").doc(String(loggedUser.displayName))
        .update({
          categories: firebase.firestore.FieldValue.arrayUnion(this.state.newCategory)
        })
        .then(
          this.fetchCategories()
        )
        .then(
          this.setState({ newCategory: null })
        )
    }

  }

  delteCategory = (category) => {
    if (category != null) {
      // koiSushiRestaurant
      firebase.firestore().collection("restaurants").doc(String(loggedUser.displayName))
        .update({
          categories: firebase.firestore.FieldValue.arrayRemove(category)
        })
        .then(
          this.fetchCategories()
        )
    }
  }
  renderCategory = (category) => {
    // this.fetchCategories();
    return (
      <View>
        <View style={{ flexDirection: 'row' }}>
          <Button>
            <Text>
              {category}
            </Text>
          </Button>
          <Button
            icon="delete"
            onPress={() => this.delteCategory(category)}
          />
        </View>
      </View>

    )
  }


  render() {
    return (
      <View >
        <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 20 }}> MENU </Text>
        <Button icon="playlist-edit"
          onPress={() => { this.setState({ categoryDialogOpen: true }) }}
        >Edit Category</Button>
        <Portal>
          <Dialog
            visible={this.state.categoryDialogOpen}
            onDismiss={this.hideCategoryDialog}>
            <Dialog.Title>All Categories</Dialog.Title>
            <Dialog.Content>
              <FlatList
                data={this.state.restauCatogories}
                renderItem={({ item, index }) => this.renderCategory(item, index)}
                keyExtractor={(item, index) => index.toString()}
              />
              <TextInput
                placeholder='Enter New Category'
                value={this.state.newCategory}
                onChangeText={inputCategory => this.setState({ newCategory: inputCategory })}
              />


              <Button
                icon="plus"
                onPress={this.addCategory}
              >Add</Button>

            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={this.hideCategoryDialog}>Done</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 40 }}>
          <Button icon='step-backward'
            onPress={() => { this.props.navigation.navigate('Profile') }}
          >Back</Button>
          <Button icon='plus'
            onPress={() => { this.createNew() }}
          >Add New Dish</Button>
        </View>

        <View style={{ height: 700 }}>
          <FlatList
            data={this.state.DATA}
            renderItem={({ item }) => <Dish id={item.toString()} modalVisible={false} deleteDish={this.deleteDish} />}
            keyExtractor={item => item}
            numColumns={2}
          />
        </View>

      </View >

    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get('window').height,
    flexGrow: 1,
    //alignItems: 'center',
    //height: Dimensions.get('window').height,
    justifyContent: 'center',
  },
  container2: {
    //flex:1,
    alignItems: 'flex-start',
  },
  displayName: {
    alignSelf: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 15
  },
  banner: {
    flex: 1,
    //alignItems: 'center',
    //justifyContent: 'flex-end',
    backgroundColor: 'rgb(236, 19, 19)',
    //width: '100%',
  },

  profPic: {

    //height: "50%",
    alignSelf: 'center',

    //backgroundColor: 'green',
  },
});