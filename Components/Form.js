import {Picker} from '@react-native-picker/picker';
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
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import storage from '@react-native-firebase/storage';
import uuid from 'react-native-uuid';
import firestore from '@react-native-firebase/firestore';

const Form = () => {
  const [nama, setNama] = useState('');
  const [gender, setGender] = useState('');
  const [umur, setUmur] = useState('');
  const [status, setStatus] = useState('');
  const [ImageUri, setImageUri] = useState();
  const [file, setFile] = useState();
  const [koordinat, setKoordinat] = useState('');
  const [Longitude, setLongitude] = useState(0);
  const [Latitude, setLatitude] = useState(0);

  useEffect(() => {
    getLocation();
  });

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLongitude(position.coords.longitude);
        setLatitude(position.coords.latitude);
      },
      (error) => {
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

  const captureImage = (type) => {
    // ImagePicker.openCamera({
    //   width: 300,
    //   height: 400,
    //   cropping: true,
    // }).then((image) => {
    //   console.log(image);
    // });
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
      setImageUri(response.uri);
      setFile(response.uri.split('.').pop());
    });
  };

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
      setImageUri(response.uri);
      setFile(response.uri.split('.').pop());
    });
  };

  const sendData = () => {
    const uniqId = uuid.v4();
    const id = uniqId.toUpperCase();
    const fileName = `foto-${nama}.${file}`;
    console.log(fileName);
    const currentDate = new Date();
    const tanggal = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()} ${(
      '0' + currentDate.getHours()
    ).slice(-2)}:${('0' + currentDate.getMinutes()).slice(-2)}:${(
      '0' + currentDate.getSeconds()
    ).slice(-2)}`;
    if (ImageUri) {
      // Upload File Ke firebase storage
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
            console.log('File uploaded' + downloadUrl);

            const data = {
              id: id,
              nama: nama,
              gender: gender,
              umur: umur,
              status: status,
              urlGambar: downloadUrl,
              namaFile: fileName,
              koordinat: koordinat,
              update: tanggal,
            };
            // Menyimpan semua data di firestore
            firestore()
              .collection('users')
              .doc(id)
              .set(data)
              .then(() => {
                setNama('');
                setGender('');
                setUmur('');
                setStatus('');
                setImageUri();
                setKoordinat('');
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
            style={styles.input}
            placeholder="Masukkan Nama"
            onChangeText={(text) => setNama(text)}
            value={nama}
          />
        </View>

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

        <View>
          <Text style={styles.label}>Umur</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setUmur(text)}
            value={umur}
            placeholder="Masukkan Umur"
          />
        </View>

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
              <Text style={styles.textTombol}>Pilih File</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text style={styles.label}>Lokasi</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setKoordinat(text)}
            value={koordinat}
            placeholder="Koordinat Lokasi"
          />
          <TouchableOpacity style={styles.tombol2} onPress={getMyLocation}>
            <Text style={styles.textTombol}>Lokasi</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.tombol} onPress={sendData}>
          <Text style={styles.textTombol}>SUBMIT</Text>
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
    backgroundColor: 'black',
    borderRadius: 5,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tombol2: {
    alignSelf: 'flex-end',
    height: 50,
    width: 175,
    backgroundColor: 'black',
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
    borderRadius: 85.5,
    borderColor: 'gray',
  },
  label: {
    fontSize: 20,
    marginVertical: 5,
  },
});
