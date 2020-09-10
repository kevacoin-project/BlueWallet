import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-root-toast';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/Ionicons';
const StyleSheet = require('../../PlatformStyleSheet');
const KevaButton = require('../../common/KevaButton');
const KevaColors = require('../../common/KevaColors');
import { THIN_BORDER, SCREEN_WIDTH, toastError } from '../../util';
import {
  BlueNavigationStyle,
  BlueLoading,
  BlueBigCheckmark,
} from '../../BlueComponents';
const loc = require('../../loc');
let BlueApp = require('../../BlueApp');
let BlueElectrum = require('../../BlueElectrum');
import { FALLBACK_DATA_PER_BYTE_FEE } from '../../models/networkTransactionFees';
import { TransitionPresets } from 'react-navigation-stack';

import { connect } from 'react-redux'
import { rewardKeyValue } from '../../class/keva-ops';
import StepModal from "../../common/StepModalWizard";
import Biometric from '../../class/biometrics';

class RewardKeyValue extends React.Component {

  constructor() {
    super();
    this.state = {
      loaded: false,
      changes: false,
      saving: false,
      value: '',
      showKeyValueModal: false,
      createTransactionErr: null,
      amount: 5,
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
        <Text style={{ color: '#FFF', fontSize: 16, borderRadius: 20, backgroundColor: KevaColors.actionText, paddingVertical: 4, paddingHorizontal: 15 }}>{loc.general.reward}</Text>
      </TouchableOpacity>
    ),
    headerLeft: () => (
      <TouchableOpacity
        style={{ marginHorizontal: 16, minWidth: 150, justifyContent: 'center', alignItems: 'flex-start' }}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ color: KevaColors.actionText, fontSize: 16 }}>{loc.general.cancel}</Text>
      </TouchableOpacity>
    ),
    ...TransitionPresets.ModalTransition,
  });

  async componentDidMount() {
    const { rewardTxid } = this.props.navigation.state.params;
    this.setState({
      rewardTxid,
    });
    this.props.navigation.setParams({
      onPress: this.onSave
    });
    this.isBiometricUseCapableAndEnabled = await Biometric.isBiometricUseCapableAndEnabled();
  }

  onSave = async () => {
    const { value } = this.state;
    const { namespaceList } = this.props;

    const wallets = BlueApp.getWallets();
    if (wallets.length == 0) {
      toastError("You don't have wallet");
      return;
    }

    const namespaces = namespaceList.namespaces;
    const defaultNamespaceId = namespaces[Object.keys(namespaces)[0]].id;

    this.setState({
      showKeyValueModal: true,
      currentPage: 0,
      showSkip: true,
      broadcastErr: null,
      isBroadcasting: false,
      fee: 0,
      createTransactionErr: null,
      currentPage: 0,
      namespaceId: this.state.namespaceId || defaultNamespaceId,
    });
  }

  KeyValueCreationFinish = () => {
    return this.setState({ showKeyValueModal: false });
  }

  KeyValueCreationCancel = () => {
    return this.setState({ showKeyValueModal: false });
  }

  KeyValueCreationNext = () => {
    return this.setState({
      currentPage: this.state.currentPage + 1
    });
  }

  getRewardKeyValueModal = () => {
    const { namespaceList } = this.props;
    const { rewardTxid, rootAddress, onGoBack } = this.props.navigation.state.params;
    if (!this.state.showKeyValueModal) {
      return null;
    }

    const walletId = namespaceList.namespaces[this.state.namespaceId].walletId;
    const wallets = BlueApp.getWallets();
    const wallet = wallets.find(w => w.getID() == walletId);

    const namespaces = namespaceList.namespaces;
    const items = Object.keys(namespaces).map(ns => ({label: namespaces[ns].displayName, value: namespaces[ns].id}));
    let selectNamespacePage = (
      <View style={styles.modalNS}>
        <Text style={[styles.modalText, {textAlign: 'center', marginBottom: 20, color: KevaColors.darkText}]}>{"Choose a namespace"}</Text>
        <RNPickerSelect
          value={this.state.namespaceId}
          useNativeAndroidPickerStyle={false}
          style={{
            inputAndroid: styles.inputAndroid,
            inputIOS: styles.inputIOS,
          }}
          onValueChange={(namespaceId) => this.setState({namespaceId})}
          items={items}
          Icon={() => <Icon name="ios-arrow-down" size={24} color={KevaColors.actionText} style={{ padding: 12 }} />}
        />
        {
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Text style={[styles.modalBalance, {color: KevaColors.lightText}]}>{loc.general.balance + ': '}</Text>
            <Text style={[styles.modalBalance]}>{wallet.getBalance()/100000000 + ' KVA'}</Text>
          </View>
        }
        <KevaButton
          type='secondary'
          style={{margin:10, marginTop: 40}}
          caption={'Next'}
          onPress={async () => {
            try {
              const {namespaceId, value, amount} = this.state;
              const shortCode = namespaceList.namespaces[namespaceId].shortCode;
              if (!shortCode) {
                toastError(loc.namespaces.namespace_unconfirmed);
                throw new Error('Namespace not confirmed yet');
              }
              if (!wallet) {
                throw new Error('Wallet not found');
              }

              const acutalAmount = amount * 100000000;
              if (wallet.getBalance() < acutalAmount) {
                return alert(loc.send.details.total_exceeds_balance);
              }

              this.setState({ showNSCreationModal: true, currentPage: 1 });
              const { tx, fee, cost, key } = await rewardKeyValue(wallet, FALLBACK_DATA_PER_BYTE_FEE,
                namespaceId, shortCode, value, acutalAmount, rootAddress, rewardTxid);
              let feeKVA = (fee + cost) / 100000000;
              this.setState({ showNSCreationModal: true, currentPage: 2, fee: feeKVA, key });
              this.namespaceTx = tx;
            } catch (err) {
              console.warn(err);
              this.setState({createTransactionErr: loc.namespaces.namespace_creation_err + ' [' + err.message + ']'});
            }
          }}
        />
      </View>
    );

    let createNSPage = (
      <View style={styles.modalNS}>
        {
          this.state.createTransactionErr ?
            <>
              <Text style={[styles.modalText, { color: KevaColors.errColor, fontWeight: 'bold' }]}>{"Error"}</Text>
              <Text style={styles.modalErr}>{this.state.createTransactionErr}</Text>
              <KevaButton
                type='secondary'
                style={{ margin: 10, marginTop: 30 }}
                caption={'Cancel'}
                onPress={async () => {
                  this.setState({ showKeyValueModal: false, createTransactionErr: null });
                }}
              />
            </>
            :
            <>
              <Text style={[styles.modalText, { alignSelf: 'center', color: KevaColors.darkText }]}>{loc.namespaces.creating_tx}</Text>
              <Text style={styles.waitText}>{loc.namespaces.please_wait}</Text>
              <BlueLoading style={{ paddingTop: 30 }} />
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
          style={{ margin: 10, marginTop: 40 }}
          caption={'Confirm'}
          onPress={async () => {
            this.setState({ currentPage: 3, isBroadcasting: true });
            try {
              await BlueElectrum.ping();
              await BlueElectrum.waitTillConnected();
              if (this.isBiometricUseCapableAndEnabled) {
                if (!(await Biometric.unlockWithBiometrics())) {
                  this.setState({ isBroadcasting: false });
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
              this.setState({ isBroadcasting: false, showSkip: false });
            } catch (err) {
              this.setState({ isBroadcasting: false });
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
          <BlueLoading style={{ paddingTop: 30 }} />
        </View>
      );
    } else if (this.state.broadcastErr) {
      broadcastPage = (
        <View style={styles.modalNS}>
          <Text style={[styles.modalText, { color: KevaColors.errColor, fontWeight: 'bold' }]}>{"Error"}</Text>
          <Text style={styles.modalErr}>{this.state.broadcastErr}</Text>
          <KevaButton
            type='secondary'
            style={{ margin: 10, marginTop: 30 }}
            caption={'Cancel'}
            onPress={async () => {
              this.setState({ showKeyValueModal: false });
            }}
          />
        </View>
      );
    } else {
      broadcastPage = (
        <View style={styles.modalNS}>
          <BlueBigCheckmark style={{ marginHorizontal: 50 }} />
          <KevaButton
            type='secondary'
            style={{ margin: 10, marginTop: 30 }}
            caption={'Done'}
            onPress={async () => {
              this.setState({
                showKeyValueModal: false,
                nsName: '',
              });
              Toast.show(loc.general.reward_sent, {
                position: Toast.positions.TOP,
                backgroundColor: "#53DD6C",
              });

              // Update the previous screen.
              if (onGoBack) {
                // Insert the tx into the replies of the target namespace.
                const {namespaceId, key, value} = this.state;
                const {shortCode, displayName} = namespaceList.namespaces[namespaceId];
                let reward = {
                  key,
                  value,
                  height: 0,
                  rewarder: {
                    shortCode,
                    displayName,
                  }
                }
                onGoBack(reward);
              }
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
          stepComponents={[selectNamespacePage, createNSPage, confirmPage, broadcastPage]}
          onFinish={this.KeyValueCreationFinish}
          onNext={this.KeyValueCreationNext}
          onCancel={this.KeyValueCreationCancel} />
      </View>
    );
  }

  render() {
    let { navigation, dispatch } = this.props;
    const amountList = [0.1, 0.5, 1, 2, 5, 10].map(a => (
      <KevaButton
        type={this.state.amount == a ? 'secondary' : 'bordered'}
        key={a}
        style={{margin:10, marginTop: 40, width: 100}}
        caption={a + ' KVA'}
        onPress={() => {this.setState({amount: a})}}
      />
    ));
    return (
      <View style={styles.container}>
        {this.getRewardKeyValueModal()}
        <View style={{flexDirection: 'row', backgroundColor: '#fff', justifyContent: 'center', }}>
          <Text style={styles.modalReward}>{this.state.amount + ' KVA'}</Text>
        </View>
        <View style={styles.inputValue1}>
          { amountList.slice(0, amountList.length/2) }
        </View>
        <View style={styles.inputValue2}>
        { amountList.slice(amountList.length/2, amountList.length) }
        </View>
        { false &&
          <View style={styles.inputValue3}>
            <KevaButton
              type={'bordered'}
              style={{margin:10, marginTop: 40, width: 180}}
              caption={'Other Amount'}
              onPress={() => {this.setState({amount: -1})}}
            />
          </View>
        }
      </View>
    );
  }

}

function mapStateToProps(state) {
  return {
    keyValueList: state.keyValueList,
    namespaceList: state.namespaceList,
  }
}

export default RewardKeyValueScreen = connect(mapStateToProps)(RewardKeyValue);

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KevaColors.background,
  },
  inputValue1: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
  },
  inputValue2: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
  },
  inputValue3: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingBottom: 20,
    borderBottomColor: KevaColors.cellBorder,
    borderBottomWidth: THIN_BORDER,
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
  modalReward: {
    fontSize: 20,
    fontWeight: '700',
    color: KevaColors.statusColor,
    letterSpacing: 2,
  },
  modalFee: {
    fontSize: 18,
    color: KevaColors.statusColor,
  },
  modalBalance: {
    fontSize: 16,
    color: KevaColors.statusColor,
    textAlign: 'center',
    marginTop: 10
  },
  modalErr: {
    fontSize: 16,
    marginTop: 20,
  },
  inputAndroid: {
    width: SCREEN_WIDTH*0.8,
    color: KevaColors.lightText,
    textAlign: 'center',
    fontSize: 16,
    borderWidth: THIN_BORDER,
    borderColor: KevaColors.lightText,
    borderRadius: 4
  },
  inputIOS: {
    width: SCREEN_WIDTH*0.8,
    color: KevaColors.lightText,
    textAlign: 'center',
    fontSize: 16,
    borderWidth: THIN_BORDER,
    borderColor: KevaColors.lightText,
    borderRadius: 4
  },
});
