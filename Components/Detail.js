import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const Detail = (props) => {
  const data = props.route.params.item;

  const hapusData = () => {
    // Hapus data di firestore
    firestore()
      .collection('users')
      .doc(data.id)
      .delete()
      .then(() => {
        // Hapus file di storage
        const storageRef = storage().ref(`images/${data.namaFile}`);
        storageRef.delete().then(() => {
          alert('Data Berhasil Dihapus');
          // Kembali Ke halaman Utama
          props.navigation.navigate('Users');
        });
      });
  };
  const editData = () => {
    props.navigation.navigate('Update', {data});
    console.log('test');
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Detail User</Text>
      </View>

      <View style={styles.postContent}>
        <Text style={styles.date}>Terakhir Update : {data.update}</Text>
        <View style={styles.profile}>
          <Image style={styles.avatar} source={{uri: data.urlGambar}} />
        </View>
        <Text style={styles.name}>{data.nama}</Text>
        <Text style={styles.text}>Umur : {data.umur} Tahun</Text>
        <Text style={styles.text}>Status : {data.status}</Text>
        <Text style={styles.text}>Alamat : {data.koordinat}</Text>
        <TouchableOpacity
          onPress={() => {
            editData();
          }}
          style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={hapusData} style={styles.shareButton2}>
          <Text style={styles.shareButtonText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Detail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#00BFFF',
  },
  headerTitle: {
    fontSize: 30,
    color: '#FFFFFF',
    marginTop: 10,
  },
  name: {
    fontSize: 25,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  text: {
    fontSize: 20,
    color: 'black',
    fontWeight: '600',
  },
  postContent: {
    flex: 1,
    padding: 30,
  },
  postTitle: {
    fontSize: 26,
    fontWeight: '600',
  },
  postDescription: {
    fontSize: 16,
    marginTop: 10,
  },
  tags: {
    color: '#00BFFF',
    marginTop: 10,
  },
  date: {
    fontSize: 10,
    color: '#696969',
    marginTop: 10,
    textAlign: 'center',
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#00BFFF',
  },
  profile: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 20,
  },
  shareButton: {
    marginTop: 10,
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#00BFFF',
  },
  shareButton2: {
    marginTop: 10,
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: 'red',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
});
