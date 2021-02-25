import {Picker} from '@react-native-picker/picker';
import Geolocation from 'react-native-geolocation-service';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import React, {useEffect} from 'react';
import {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Divider} from 'react-native-elements';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const Form = (props) => {
  const data = props.route.params.data;
  const [nama, setNama] = useState(data.nama);
  const [gender, setGender] = useState(data.gender);
  const [umur, setUmur] = useState(data.umur);
  const [status, setStatus] = useState(data.status);
  const [ImageUri, setImageUri] = useState(data.urlGambar);
  const [koordinat, setKoordinat] = useState(data.koordinat);
  const [Longitude, setLongitude] = useState(0);
  const [Latitude, setLatitude] = useState(0);
  console.log(data);

  useEffect(() => {
    // Untuk menjalanakan fungsi getLocation supaya lokasi kita dapat diambil secara realtime
    getLocation();
  });

  //   Untuk mendapatkan lokasi kiya
  const getLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        // console.log(position)
        setLongitude(position.coords.longitude);
        setLatitude(position.coords.latitude);
      },
      (error) => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        forceRequestLocation: true,
      },
    );
  };

  const getMyLocation = () => {
    setKoordinat(`${Longitude}, ${Latitude}`);
  };

  // Untuk Ambil Gambar Dari File di HP
  const captureImage = (type) => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
      videoQuality: 'low',
      durationLimit: 30, //Video max duration in seconds
      saveToPhotos: true,
    };
    launchCamera(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        alert('User cancelled camera picker');
        return;
      } else if (response.errorCode === 'camera_unavailable') {
        alert('Camera not available on device');
        return;
      } else if (response.errorCode === 'permission') {
        alert('Permission not satisfied');
        return;
      } else if (response.errorCode === 'others') {
        alert(response.errorMessage);
        return;
      }
      console.log('base64 -> ', response.base64);
      console.log('uri -> ', response.uri);
      console.log('width -> ', response.width);
      console.log('height -> ', response.height);
      console.log('fileSize -> ', response.fileSize);
      console.log('type -> ', response.type);
      console.log('fileName -> ', response.fileName);
      setImageUri(response.uri);
    });
  };

  // Untuk Ambil Gambar Dari File di HP
  const chooseFile = (type) => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
    };
    launchImageLibrary(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        alert('User cancelled camera picker');
        return;
      } else if (response.errorCode === 'camera_unavailable') {
        alert('Camera not available on device');
        return;
      } else if (response.errorCode === 'permission') {
        alert('Permission not satisfied');
        return;
      } else if (response.errorCode === 'others') {
        alert(response.errorMessage);
        return;
      }
      console.log('base64 -> ', response.base64);
      console.log('uri -> ', response.uri);
      console.log('width -> ', response.width);
      console.log('height -> ', response.height);
      console.log('fileSize -> ', response.fileSize);
      console.log('type -> ', response.type);
      console.log('fileName -> ', response.fileName);
      setImageUri(response.uri);
    });
  };

  const sendData = () => {
    const fileName = data.namaFile;
    console.log(fileName);
    const currentDate = new Date();
    const tanggal = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()} ${(
      '0' + currentDate.getHours()
    ).slice(-2)}:${('0' + currentDate.getMinutes()).slice(-2)}:${(
      '0' + currentDate.getSeconds()
    ).slice(-2)}`;
    // Jika Gambar tidak Diubah
    if (ImageUri === data.urlGambar) {
      const update = {
        id: data.id,
        nama: nama,
        gender: gender,
        umur: umur,
        status: status,
        urlGambar: data.urlGambar,
        namaFile: fileName,
        koordinat: koordinat,
        update: tanggal,
      };
      firestore()
        .collection('users')
        .doc(data.id)
        .update(update)
        .then(() => {
          setNama('');
          setGender('');
          setUmur('');
          setStatus('');
          setImageUri();
          setKoordinat('');
          props.navigation.navigate('Users');
        })
        .catch((error) => {
          alert(error);
        });
    }
    // Jika Gambar Diubah
    else {
      const storageRef = storage().ref(`images/${fileName}`);
      storageRef.putFile(`${ImageUri}`).on(
        storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          console.log('snapshot: ' + snapshot.state);
          console.log(
            'progress: ' +
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );

          if (snapshot.state === storage.TaskState.SUCCESS) {
            console.log('Success');
          }
        },
        (error) => {
          console.log('image upload error: ' + error.toString());
        },
        () => {
          // Untuk mendapatkan url dari file yang kita upload
          storageRef.getDownloadURL().then((downloadUrl) => {
            console.log('File available at: ' + downloadUrl);

            const update = {
              id: data.id,
              nama: nama,
              gender: gender,
              usia: umur,
              status: status,
              urlGambar: downloadUrl,
              namaFile: fileName,
              koordinat: koordinat,
              update: tanggal,
            };
            // Menyimpan semua data di firestore
            firestore()
              .collection('users')
              .doc(data.id)
              .update(update)
              .then(() => {
                setNama('');
                setGender('');
                setUmur('');
                setStatus('');
                setImageUri();
                setKoordinat('');
                props.navigation.navigate('Users');
              })
              .catch((error) => {
                alert(error);
              });
          });
        },
      );
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView>
        <View>
          <Text style={styles.label}>Nama</Text>
          <TextInput
            onChangeText={(text) => setNama(text)}
            value={nama}
            style={styles.input}
            placeholder="Masukkan Nama"
          />
        </View>
        <Divider />
        <View>
          <Text style={styles.label}>Jenis Kelamin</Text>
          <Picker
            mode={'dropdown'}
            style={styles.input}
            selectedValue={gender}
            onValueChange={(value) => setGender(value)}>
            <Picker.Item label="Pilih Jenis Kelamin" />
            <Picker.Item label="Laki-laki" value="Laki-laki" />
            <Picker.Item label="Perempuan" value="Perempuan" />
          </Picker>
        </View>
        <Divider />
        <View>
          <Text style={styles.label}>Usia</Text>
          <TextInput
            onChangeText={(text) => setUmur(text)}
            value={umur}
            style={styles.input}
            placeholder="Masukkan Usia"
          />
        </View>
        <Divider />
        <View>
          <Text style={styles.label}>Status</Text>
          <Picker
            mode={'dropdown'}
            style={styles.input}
            selectedValue={status}
            onValueChange={(value) => setStatus(value)}>
            <Picker.Item label="Pilih Status" />
            <Picker.Item label="Lajang" value="Lajang" />
            <Picker.Item label="Menikah" value="Menikah" />
          </Picker>
        </View>
        <Divider />
        <Text style={styles.label}>Foto</Text>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          <View>
            <Image source={{uri: ImageUri}} style={styles.imageStyle} />
          </View>
          <View>
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles.tombol2}
              onPress={() => captureImage('photo')}>
              <Text style={styles.textTombol}>Buka Kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles.tombol2}
              onPress={() => chooseFile('photo')}>
              <Text style={styles.textTombol}>Choose Image</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Divider />
        <View>
          <Text style={styles.label}>Lokasi</Text>
          <TextInput
            onChangeText={(text) => setKoordinat(text)}
            value={koordinat}
            style={styles.input}
            placeholder="Koordinat Lokasi"
          />
          <TouchableOpacity onPress={getMyLocation} style={styles.tombol2}>
            <Text style={styles.textTombol}>Dapatkan Lokasi</Text>
          </TouchableOpacity>
        </View>
        <Divider />
        <TouchableOpacity onPress={sendData} style={styles.tombol}>
          <Text style={styles.textTombol}>Update</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default Form;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 30,
  },
  input: {
    height: 50,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  tombol: {
    height: 50,
    backgroundColor: 'pink',
    borderRadius: 5,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tombol2: {
    alignSelf: 'flex-end',
    height: 50,
    width: 175,
    backgroundColor: '#66ccff',
    borderRadius: 5,
    marginVertical: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  textTombol: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  imageStyle: {
    width: 175,
    height: 175,
    marginVertical: 5,
    marginHorizontal: 5,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'gray',
  },
  label: {
    fontSize: 20,
    marginVertical: 5,
  },
});
