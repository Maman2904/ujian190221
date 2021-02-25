import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {ActivityIndicator} from 'react-native';
import {Divider} from 'react-native-elements';

export default function Home({navigation}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ]);
          // If Permission is granted
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
          console.warn(err);
          alert('Write permission err', err);
        }
        return false;
      } else {
        return true;
      }
    };

    // Untuk mendapat nama user dar firestore
    const subscriber = firestore()
      .collection('users')
      .onSnapshot((querySnapshot) => {
        const users = [];
        querySnapshot.forEach((documentSnapshot) => {
          users.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });
        setData(users);
        setLoading(false);
      });

    // Unsubscribe from events when no longer in use
    return () => {
      subscriber();
      requestPermission();
    };
  });

  if (loading) {
    return <ActivityIndicator />;
  }

  const TambahData = () => {
    navigation.navigate('Form');
  };

  const detailData = (item) => {
    console.log(item);
    navigation.navigate('Detail', {item});
  };

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          detailData(item);
        }}
        style={styles.row}>
        <Image source={{uri: item.urlGambar}} style={styles.pic} />
        <View>
          <View style={styles.nameContainer}>
            <Text style={styles.nameTxt} numberOfLines={1} ellipsizeMode="tail">
              {item.nama}
            </Text>
            <Text style={styles.mblTxt}>{item.status}</Text>
          </View>
          <View style={styles.msgContainer}>
            <Text style={styles.msgTxt}>
              {item.gender} / {item.umur} Tahun
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: 'white',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
          paddingVertical: 10,
        }}>
        <Text style={styles.label}>Total User : {data.length}</Text>
        <TouchableOpacity onPress={TambahData} style={styles.tombol}>
          <Text style={styles.textTombol}>Tambah User</Text>
        </TouchableOpacity>
      </View>
      <Divider />
      <FlatList
        data={data}
        keyExtractor={(item) => {
          return item.id;
        }}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DCDCDC',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    padding: 10,
    marginVertical: 5,
  },
  pic: {
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 280,
  },
  nameTxt: {
    marginLeft: 15,
    fontWeight: '600',
    color: '#222',
    fontSize: 20,
    width: 170,
  },
  mblTxt: {
    fontWeight: '200',
    color: '#777',
    fontSize: 15,
  },
  msgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  msgTxt: {
    fontWeight: '400',
    color: '#008B8B',
    fontSize: 15,
    marginLeft: 15,
  },
  tombol: {
    borderWidth: 1,
    borderColor: 'grey',
    padding: 5,
    borderRadius: 5,
    backgroundColor: 'pink',
  },
});
