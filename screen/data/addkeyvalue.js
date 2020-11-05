import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-root-toast';
const StyleSheet = require('../../PlatformStyleSheet');
const KevaButton = require('../../common/KevaButton');
const KevaColors = require('../../common/KevaColors');
const utils = require('../../util');
import {
  BlueNavigationStyle,
  BlueLoading,
  BlueBigCheckmark,
} from '../../BlueComponents';
const loc = require('../../loc');
let BlueApp = require('../../BlueApp');
let BlueElectrum = require('../../BlueElectrum');
import { FALLBACK_DATA_PER_BYTE_FEE } from '../../models/networkTransactionFees';

import { connect } from 'react-redux'
import { updateKeyValue } from '../../class/keva-ops';
import FloatTextInput from '../../common/FloatTextInput';
import StepModal from "../../common/StepModalWizard";
import Biometric from '../../class/biometrics';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from 'react-native-image-resizer';

//const CAMERA_ICON   = <Icon name="photo-camera" size={27} color={KevaColors.actionText}/>;
const LIBRARY_ICON  = <Icon name="insert-photo" size={27} color={KevaColors.actionText}/>;
const IMAGE_SIZE = 1200;

class AddKeyValue extends React.Component {

  constructor() {
    super();
    this.state = {
      loaded: false,
      changes: false,
      saving: false,
      key: '',
      value: '',
      showKeyValueModal: false,
      valueOnly: false,
      createTransactionErr: null,
    };
  }

  static navigationOptions = ({ navigation }) => ({
    ...BlueNavigationStyle(),
    title: '',
    tabBarVisible: false,
    headerRight: () => (
      <TouchableOpacity
        style={{ marginHorizontal: 16, minWidth: 150, justifyContent: 'center', alignItems: 'flex-end' }}
        onPress={navigation.state.params.onPress}
      >
        <Text style={{color: KevaColors.actionText, fontSize: 16}}>Save</Text>
      </TouchableOpacity>
    ),
  });

  async componentDidMount() {
    const {namespaceId, walletId, key, value} = this.props.navigation.state.params;
    if (key && key.length > 0 && value && value.length > 0) {
      this.setState({
        key,
        value,
        valueOnly: true
      });
    }
    this.props.navigation.setParams({
      onPress: this.onSave
    });
    this.isBiometricUseCapableAndEnabled = await Biometric.isBiometricUseCapableAndEnabled();
  }

  onSave = async () => {
    const {namespaceId, walletId} = this.props.navigation.state.params;
    const {key, value} = this.state;
    if (key.length == 0 || value.length == 0) {
      Toast.show('Key and value must be set');
      return;
    }
    const wallets = BlueApp.getWallets();
    this.wallet = wallets.find(w => w.getID() == walletId);
    if (!this.wallet) {
      Toast.show('Cannot find wallet');
      return;
    }

    this.setState({
      showKeyValueModal: true,
      currentPage: 0,
      showSkip: true,
      broadcastErr: null,
      isBroadcasting: false,
      fee: 0,
      createTransactionErr: null,
    }, () => {
      setTimeout(async () => {
        try {
          await BlueElectrum.ping();
          const { tx, fee } = await updateKeyValue(this.wallet, FALLBACK_DATA_PER_BYTE_FEE, namespaceId, key, value);
          let feeKVA = fee / 100000000;
          this.setState({ showKeyValueModal: true, currentPage: 1, fee: feeKVA });
          this.namespaceTx = tx;
        } catch (err) {
          console.warn(err);
          this.setState({createTransactionErr: err.message});
        }
      }, 800);
    });
  }

  KeyValueCreationFinish = () => {
    return this.setState({showKeyValueModal: false});
  }

  KeyValueCreationCancel = () => {
    return this.setState({showKeyValueModal: false});
  }

  KeyValueCreationNext = () => {
    return this.setState({
      currentPage: this.state.currentPage + 1
    });
  }

  getKeyValueModal = () => {
    if (!this.state.showKeyValueModal) {
      return null;
    }

    let createNSPage = (
      <View style={styles.modalNS}>
        {
          this.state.createTransactionErr ?
            <>
              <Text style={[styles.modalText, {color: KevaColors.errColor, fontWeight: 'bold'}]}>{"Error"}</Text>
              <Text style={styles.modalErr}>{this.state.createTransactionErr}</Text>
              <KevaButton
                type='secondary'
                style={{margin:10, marginTop: 30}}
                caption={'Cancel'}
                onPress={async () => {
                  this.setState({showKeyValueModal: false, createTransactionErr: null});
                }}
              />
            </>
          :
            <>
              <Text style={[styles.modalText, {alignSelf: 'center', color: KevaColors.darkText}]}>{loc.namespaces.creating_tx}</Text>
              <Text style={styles.waitText}>{loc.namespaces.please_wait}</Text>
              <BlueLoading style={{paddingTop: 30}}/>
            </>
        }
      </View>
    );

    let confirmPage = (
      <View style={styles.modalNS}>
        <Text style={styles.modalText}>{"Transaction fee:  "}
          <Text style={styles.modalFee}>{this.state.fee + ' KVA'}</Text>
        </Text>
        <KevaButton
          type='secondary'
          style={{margin:10, marginTop: 40}}
          caption={'Confirm'}
          onPress={async () => {
            this.setState({currentPage: 2, isBroadcasting: true});
            try {
              await BlueElectrum.ping();
              await BlueElectrum.waitTillConnected();
              if (this.isBiometricUseCapableAndEnabled) {
                if (!(await Biometric.unlockWithBiometrics())) {
                  this.setState({isBroadcasting: false});
                  return;
                }
              }
              let result = await BlueElectrum.broadcast(this.namespaceTx);
              if (result.code) {
                // Error.
                return this.setState({
                  isBroadcasting: false,
                  broadcastErr: result.message,
                });
              }
              await BlueApp.saveToDisk();
              this.setState({isBroadcasting: false, showSkip: false});
            } catch (err) {
              this.setState({isBroadcasting: false});
              console.warn(err);
            }
          }}
        />
      </View>
    );

    let broadcastPage;
    if (this.state.isBroadcasting) {
      broadcastPage = (
        <View style={styles.modalNS}>
          <Text style={styles.modalText}>{"Broadcasting Transaction ..."}</Text>
          <BlueLoading style={{paddingTop: 30}}/>
        </View>
      );
    } else if (this.state.broadcastErr) {
      broadcastPage = (
        <View style={styles.modalNS}>
          <Text style={[styles.modalText, {color: KevaColors.errColor, fontWeight: 'bold'}]}>{"Error"}</Text>
          <Text style={styles.modalErr}>{this.state.broadcastErr}</Text>
          <KevaButton
            type='secondary'
            style={{margin:10, marginTop: 30}}
            caption={'Cancel'}
            onPress={async () => {
              this.setState({showKeyValueModal: false});
            }}
          />
        </View>
      );
    } else {
      broadcastPage = (
        <View style={styles.modalNS}>
          <BlueBigCheckmark style={{marginHorizontal: 50}}/>
          <KevaButton
            type='secondary'
            style={{margin:10, marginTop: 30}}
            caption={'Done'}
            onPress={async () => {
              this.setState({
                showKeyValueModal: false,
                nsName: '',
              });
              this.props.navigation.goBack();
            }}
          />
        </View>
      );
    }

    return (
      <View>
        <StepModal
          showNext={false}
          showSkip={this.state.showSkip}
          currentPage={this.state.currentPage}
          stepComponents={[createNSPage, confirmPage, broadcastPage]}
          onFinish={this.KeyValueCreationFinish}
          onNext={this.KeyValueCreationNext}
          onCancel={this.KeyValueCreationCancel}/>
      </View>
    );
  }

  onUpload = async (image, size) => {
    try {
      /*
      await IPFSManager.startIpfs();
      let peers = await IPFSManager.checkPeers();
      while (peers.length == 0) {
        await BlueApp.sleep(2000);
        peers = await IPFSManager.checkPeers();
      }
      await IPFSManager.upload(image);
      */
    } catch (err) {
      console.warn(err);
    }
  }

  onImageDone = async (response) => {
    if (response.didCancel) {
      return;
    }

    let image = response.path;
    try {
      if (response.width > IMAGE_SIZE || response.height > IMAGE_SIZE) {
        let resizedImage = await ImageResizer.createResizedImage(image, IMAGE_SIZE, IMAGE_SIZE, 'JPEG', 90);
        console.log(resizedImage)
        image = resizedImage.uri;
      }
      const size = await utils.getImageSize(image);
      this.onUpload(image, size);
    } catch (err) {
      console.warn(err);
    }
  }

  onImage = () => {
    /*
    const pickerOptions = {
      title: 'Select Pictures',
      storageOptions: {
        skipBackup: true
      },
      noData: true
    };
    ImagePicker.launchImageLibrary(pickerOptions, response => this.onImageDone(response));
    */
    ImagePicker.openPicker({
    }).then(image => {
      console.log(image);
      this.onImageDone(image)
    });
  }

  render() {
    let {navigation, dispatch} = this.props;
    return (
      <View style={styles.container}>
        {this.getKeyValueModal()}
        <View style={styles.inputKey}>
          <FloatTextInput
            editable={!this.state.valueOnly}
            noBorder
            autoCorrect={false}
            value={this.state.key}
            underlineColorAndroid='rgba(0,0,0,0)'
            style={{fontSize:15,flex:1}}
            placeholder={'Key'}
            clearButtonMode="while-editing"
            onChangeTextValue={key => {this.setState({key})}}
          />
        </View>
        <TouchableOpacity onPress={this.onImage}>
          <View elevation={1} style={styles.iconBtn}>
            {LIBRARY_ICON}
          </View>
        </TouchableOpacity>
        <View style={styles.inputValue}>
          <FloatTextInput
            multiline={true}
            noBorder
            autoCorrect={false}
            value={this.state.value}
            underlineColorAndroid='rgba(0,0,0,0)'
            style={{fontSize:15,flex:1}}
            placeholder={'Value'}
            clearButtonMode="while-editing"
            onChangeTextValue={value => {this.setState({value})}}
          />
        </View>
      </View>
    );
  }

}

function mapStateToProps(state) {
  return {
    keyValueList: state.keyValueList,
  }
}

export default AddKeyValueScreen = connect(mapStateToProps)(AddKeyValue);

var styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: KevaColors.background,
  },
  inputKey: {
    height:45,
    marginTop: 10,
    borderWidth: utils.THIN_BORDER,
    borderColor: KevaColors.cellBorder,
    backgroundColor: '#fff',
    paddingHorizontal: 10
  },
  inputValue: {
    height:215,
    borderWidth: utils.THIN_BORDER,
    borderColor: KevaColors.cellBorder,
    backgroundColor: '#fff',
    paddingHorizontal: 10
  },
  modalNS: {
    height: 300,
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  modalText: {
    fontSize: 18,
    color: KevaColors.lightText,
  },
  waitText: {
    fontSize: 16,
    color: KevaColors.lightText,
    paddingTop: 10,
    alignSelf: 'center',
  },
  modalFee: {
    fontSize: 18,
    color: KevaColors.statusColor,
  },
  modalErr: {
    fontSize: 16,
    marginTop: 20,
  },
  iconBtn: {
    alignSelf: 'flex-end',
    marginVertical: 5,
    marginRight: 15,
  },
});
