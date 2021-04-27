import AsyncStorage from '@react-native-community/async-storage';
import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store';
import {
  HDLegacyBreadwalletWallet,
  HDSegwitP2SHWallet,
  HDLegacyP2PKHWallet,
  WatchOnlyWallet,
  LegacyWallet,
  SegwitP2SHWallet,
  SegwitBech32Wallet,
  HDSegwitBech32Wallet,
  PlaceholderWallet,
  LightningCustodianWallet,
  HDLegacyElectrumSeedP2PKHWallet,
  HDSegwitElectrumSeedP2WPKHWallet,
} from './';
import MMKVStorage from "react-native-mmkv-storage";
import WatchConnectivity from '../WatchConnectivity';
import DeviceQuickActions from './quickActions';
const encryption = require('../encryption');

export class AppStorage {
  static FLAG_ENCRYPTED = 'data_encrypted';
  static LANG = 'lang';
  static EXCHANGE_RATES = 'currency';
  static LNDHUB = 'lndhub';
  static ELECTRUM_HOST = 'electrum_host';
  static ELECTRUM_TCP_PORT = 'electrum_tcp_port';
  static ELECTRUM_SSL_PORT = 'electrum_ssl_port';
  static PREFERRED_CURRENCY = 'preferredCurrency';
  static ADVANCED_MODE_ENABLED = 'advancedmodeenabled';
  static DELETE_WALLET_AFTER_UNINSTALL = 'deleteWalletAfterUninstall';
  static STATUS_ENABLED = 'statusenabled';
  static IPFS_GATEWAY = 'ipfs_gateway';
  static IPFS_CUSTOM_GATEWAY = 'ipfs_custom_gateway';
  static STORAGE_VERSION = 'storage_version';
  static LOCKED_FUND = 'locked_fund';

  constructor() {
    /** {Array.<AbstractWallet>} */
    this.wallets = [];
    this.tx_metadata = {};
    this.cachedPassword = false;
    this.settings = {
      brandingColor: '#ffffff',
      foregroundColor: '#0c2550',
      buttonBackgroundColor: '#c83f6d',
      buttonTextColor: '#ffffff',
      buttonAlternativeTextColor: '#ffffff',
      buttonDisabledBackgroundColor: '#eef0f4',
      buttonDisabledTextColor: '#9aa0aa',
      secondaryButtonTextColor: '#c83f6d',
      inputBorderColor: '#d2d2d2',
      inputBackgroundColor: '#f5f5f5',
      alternativeTextColor: '#9aa0aa',
      alternativeTextColor2: '#0f5cc0',
      buttonBlueBackgroundColor: '#ccddf9',
      incomingBackgroundColor: '#d2f8d6',
      incomingForegroundColor: '#37c0a1',
      outgoingBackgroundColor: '#f8d2d2',
      outgoingForegroundColor: '#d0021b',
      successColor: '#37c0a1',
      failedColor: '#ff0000',
      shadowColor: '#000000',
      inverseForegroundColor: '#ffffff',
      hdborderColor: '#df8faa',
      hdbackgroundColor: '#f1cfda',
      lnborderColor: '#F7C056',
      lnbackgroundColor: '#FFFAEF',
    };
    this.MMKV = new MMKVStorage.Loader().initialize();
  }

  /**
   * Wrapper for storage call. Secure store works only in RN environment. AsyncStorage is
   * used for cli/tests
   *
   * @param key
   * @param value
   * @returns {Promise<any>|Promise<any> | Promise<void> | * | Promise | void}
   */
  setItem(key, value) {
    return RNSecureKeyStore.set(key, value, { accessible: ACCESSIBLE.WHEN_UNLOCKED });
  }

  /**
   * Wrapper for storage call. Secure store works only in RN environment. AsyncStorage is
   * used for cli/tests
   *
   * @param key
   * @returns {Promise<any>|*}
   */
  getItem(key) {
    return RNSecureKeyStore.get(key);
  }

    /**
   * Wrapper for storage call. Always use AsyncStorage.
   * used for cli/tests
   *
   * @param key
   * @param value
   * @returns {Promise<any>|Promise<any> | Promise<void> | * | Promise | void}
   */
  setItemStorage(key, value) {
    return this.MMKV.setStringAsync(key, value);
  }

  /**
   * Wrapper for storage call. Always use AsyncStorage.
   *
   * @param key
   * @returns {Promise<any>|*}
   */
  getItemStorage(key) {
    return this.MMKV.getStringAsync(key);
  }

  async setResetOnAppUninstallTo(value) {
    await this.setItem(AppStorage.DELETE_WALLET_AFTER_UNINSTALL, value ? '1' : '');
    try {
      await RNSecureKeyStore.setResetOnAppUninstallTo(value);
    } catch (Error) {
      console.warn(Error);
    }
  }

  async storageIsEncrypted() {
    let data;
    try {
      data = await this.getItem(AppStorage.FLAG_ENCRYPTED);
    } catch (error) {
      return false;
    }

    return !!data;
  }

  async isPasswordInUse(password) {
    try {
      let data = await this.getItem('data');
      data = this.decryptData(data, password);
      return !!data;
    } catch (_e) {
      return false;
    }
  }

  /**
   * Iterates through all values of `data` trying to
   * decrypt each one, and returns first one successfully decrypted
   *
   * @param data {string} Serialized array
   * @param password
   * @returns {boolean|string} Either STRING of storage data (which is stringified JSON) or FALSE, which means failure
   */
  decryptData(data, password) {
    data = JSON.parse(data);
    let decrypted;
    for (let value of data) {
      try {
        decrypted = encryption.decrypt(value, password);
      } catch (e) {
        console.log(e.message);
      }

      if (decrypted) {
        return decrypted;
      }
    }

    return false;
  }

  async decryptStorage(password) {
    if (password === this.cachedPassword) {
      this.cachedPassword = undefined;
      await this.setResetOnAppUninstallTo(true);
      await this.saveToDisk();
      this.wallets = [];
      this.tx_metadata = [];
      return this.loadFromDisk();
    } else {
      throw new Error('Wrong password. Please, try again.');
    }
  }

  async isDeleteWalletAfterUninstallEnabled() {
    let deleteWalletsAfterUninstall;
    try {
      deleteWalletsAfterUninstall = await this.getItem(AppStorage.DELETE_WALLET_AFTER_UNINSTALL);
    } catch (_e) {
      deleteWalletsAfterUninstall = true;
    }
    return !!deleteWalletsAfterUninstall;
  }

  async encryptStorage(password) {
    // assuming the storage is not yet encrypted
    await this.saveToDisk();
    let data = await this.getItem('data');
    // TODO: refactor ^^^ (should not save & load to fetch data)

    let encrypted = encryption.encrypt(data, password);
    data = [];
    data.push(encrypted); // putting in array as we might have many buckets with storages
    data = JSON.stringify(data);
    this.cachedPassword = password;
    await this.setItem('data', data);
    await this.setItem(AppStorage.FLAG_ENCRYPTED, '1');
    DeviceQuickActions.clearShortcutItems();
    DeviceQuickActions.removeAllWallets();
  }

  /**
   * Cleans up all current application data (wallets, tx metadata etc)
   * Encrypts the bucket and saves it storage
   *
   * @returns {Promise.<boolean>} Success or failure
   */
  async createFakeStorage(fakePassword) {
    this.wallets = [];
    this.tx_metadata = {};

    let data = {
      wallets: [],
      tx_metadata: {},
    };

    let buckets = await this.getItem('data');
    buckets = JSON.parse(buckets);
    buckets.push(encryption.encrypt(JSON.stringify(data), fakePassword));
    this.cachedPassword = fakePassword;
    const bucketsString = JSON.stringify(buckets);
    await this.setItem('data', bucketsString);
    return (await this.getItem('data')) === bucketsString;
  }

  /**
   * Loads from storage all wallets and
   * maps them to `this.wallets`
   *
   * @param password If present means storage must be decrypted before usage
   * @returns {Promise.<boolean>}
   */
  async loadFromDisk(password) {
    try {
      let data = await this.getItem('data');
      if (password) {
        data = this.decryptData(data, password);
        if (data) {
          // password is good, cache it
          this.cachedPassword = password;
        }
      }
      if (data !== null) {
        data = JSON.parse(data);
        if (!data.wallets) return false;
        let wallets = data.wallets;
        for (let key of wallets) {
          // deciding which type is wallet and instatiating correct object
          let tempObj = JSON.parse(key);
          let unserializedWallet;
          switch (tempObj.type) {
            case PlaceholderWallet.type:
              continue;
            case SegwitBech32Wallet.type:
              unserializedWallet = SegwitBech32Wallet.fromJson(key);
              break;
            case SegwitP2SHWallet.type:
              unserializedWallet = SegwitP2SHWallet.fromJson(key);
              break;
            case WatchOnlyWallet.type:
              unserializedWallet = WatchOnlyWallet.fromJson(key);
              unserializedWallet.init();
              break;
            case HDLegacyP2PKHWallet.type:
              unserializedWallet = HDLegacyP2PKHWallet.fromJson(key);
              break;
            case HDSegwitP2SHWallet.type:
              unserializedWallet = HDSegwitP2SHWallet.fromJson(key);
              break;
            case HDSegwitBech32Wallet.type:
              unserializedWallet = HDSegwitBech32Wallet.fromJson(key);
              break;
            case HDLegacyBreadwalletWallet.type:
              unserializedWallet = HDLegacyBreadwalletWallet.fromJson(key);
              break;
            case HDLegacyElectrumSeedP2PKHWallet.type:
              unserializedWallet = HDLegacyElectrumSeedP2PKHWallet.fromJson(key);
              break;
            case HDSegwitElectrumSeedP2WPKHWallet.type:
              unserializedWallet = HDSegwitElectrumSeedP2WPKHWallet.fromJson(key);
              break;
            case LightningCustodianWallet.type:
              /** @type {LightningCustodianWallet} */
              unserializedWallet = LightningCustodianWallet.fromJson(key);
              let lndhub = false;
              try {
                lndhub = await AsyncStorage.getItem(AppStorage.LNDHUB);
              } catch (Error) {
                console.warn(Error);
              }

              if (unserializedWallet.baseURI) {
                unserializedWallet.setBaseURI(unserializedWallet.baseURI); // not really necessary, just for the sake of readability
                console.log('using saved uri for for ln wallet:', unserializedWallet.baseURI);
              } else if (lndhub) {
                console.log('using wallet-wide settings ', lndhub, 'for ln wallet');
                unserializedWallet.setBaseURI(lndhub);
              } else {
                console.log('using default', LightningCustodianWallet.defaultBaseUri, 'for ln wallet');
                unserializedWallet.setBaseURI(LightningCustodianWallet.defaultBaseUri);
              }
              unserializedWallet.init();
              break;
            case LegacyWallet.type:
            default:
              unserializedWallet = LegacyWallet.fromJson(key);
              break;
          }
          // done
          if (!this.wallets.some(wallet => wallet.getSecret() === unserializedWallet.secret)) {
            this.wallets.push(unserializedWallet);
            this.tx_metadata = data.tx_metadata;
            if (unserializedWallet.loadNonsecuredData) {
              await unserializedWallet.loadNonsecuredData(this.MMKV);
            }
          }
        }
        WatchConnectivity.shared.wallets = this.wallets;
        WatchConnectivity.shared.tx_metadata = this.tx_metadata;
        WatchConnectivity.shared.fetchTransactionsFunction = async () => {
          await this.fetchWalletTransactions();
          await this.saveToDisk();
        };
        await WatchConnectivity.shared.sendWalletsToWatch();

        const isStorageEncrypted = await this.storageIsEncrypted();
        if (isStorageEncrypted) {
          DeviceQuickActions.clearShortcutItems();
          DeviceQuickActions.removeAllWallets();
        } else {
          DeviceQuickActions.setWallets(this.wallets);
          DeviceQuickActions.setQuickActions();
        }
        return true;
      } else {
        return false; // failed loading data or loading/decryptin data
      }
    } catch (error) {
      console.warn(error.message);
      return false;
    }
  }

  /**
   * Lookup wallet in list by it's secret and
   * remove it from `this.wallets`
   *
   * @param wallet {AbstractWallet}
   */
  deleteWallet(wallet) {
    let secret = wallet.getSecret();
    let tempWallets = [];

    for (let value of this.wallets) {
      if (value.getSecret() === secret) {
        // the one we should delete
        // nop
      } else {
        // the one we must keep
        tempWallets.push(value);
      }
    }
    this.wallets = tempWallets;
  }

  /**
   * Serializes and saves to storage object data.
   * If cached password is saved - finds the correct bucket
   * to save to, encrypts and then saves.
   *
   * @returns {Promise} Result of storage save
   */
  async saveToDisk() {
    let walletsToSave = [];
    for (let key of this.wallets) {
      if (typeof key === 'boolean' || key.type === PlaceholderWallet.type) continue;
      if (key.prepareForSerialization) key.prepareForSerialization();
      if (key.saveNonsecuredData) {
        await key.saveNonsecuredData(this.MMKV);
      }
      walletsToSave.push(JSON.stringify({ ...key, type: key.type }, (k, v) => {
        if (key.skipSerialization) {
          return key.skipSerialization(k, v);
        }
        return v;
      }));
    }
    let data = {
      wallets: walletsToSave,
      tx_metadata: this.tx_metadata,
    };

    if (this.cachedPassword) {
      // should find the correct bucket, encrypt and then save
      let buckets = await this.getItem('data');
      buckets = JSON.parse(buckets);
      let newData = [];
      for (let bucket of buckets) {
        let decrypted = encryption.decrypt(bucket, this.cachedPassword);
        if (!decrypted) {
          // no luck decrypting, its not our bucket
          newData.push(bucket);
        } else {
          // decrypted ok, this is our bucket
          // we serialize our object's data, encrypt it, and add it to buckets
          newData.push(encryption.encrypt(JSON.stringify(data), this.cachedPassword));
          await this.setItem(AppStorage.FLAG_ENCRYPTED, '1');
        }
      }
      data = newData;
    } else {
      await this.setItem(AppStorage.FLAG_ENCRYPTED, ''); // drop the flag
    }
    WatchConnectivity.shared.wallets = this.wallets;
    WatchConnectivity.shared.tx_metadata = this.tx_metadata;
    WatchConnectivity.shared.sendWalletsToWatch();
    DeviceQuickActions.setWallets(this.wallets);
    DeviceQuickActions.setQuickActions();

    // Clean the cache implemented by previous version
    if (data.txCacheHD) {
      delete data.txCacheHD;
    }

    if (data.txCacheLegacy) {
      delete data.txCacheLegacy;
    }

    return this.setItem('data', JSON.stringify(data));
  }

  async setStorageVersion(version) {
    await this.setItemStorage(AppStorage.STORAGE_VERSION, version);
  }

  async getStorageVersion() {
    await this.getItemStorage(AppStorage.STORAGE_VERSION);
  }

  async saveTxToDisk(txid, tx) {
    if (tx) {
      await this.setItemStorage(txid, JSON.stringify(tx));
    }
  }

  async getTxFromDisk(txid) {
    let data = await this.getItemStorage(txid);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }

  async getTxIdFromPos(height, pos) {
    let txid = this.getItemStorage(height + '-' + pos);
    if (txid) {
      return txid;
    }
    return null;
  }

  async savePosTxId(height, pos, txid) {
    await this.setItemStorage(height + '-' + pos, txid);
  }

  async getLockedFund() {
    let lockedFund = {};
    const lockedFundData = await this.getItemStorage(AppStorage.LOCKED_FUND);
    if (lockedFundData) {
      lockedFund = JSON.parse(lockedFundData);
    }
    return lockedFund;
  }

  async saveLockedFund(namespaceId, tx_hash, vout, fund) {
    let lockedFund = await this.getLockedFund();

    const key = `${tx_hash}:${vout}`;
    let value;

    if (fund > 0) {
      value = {
        namespaceId, fund
      };
      lockedFund[key] = value;
    } else {
      delete lockedFund[key];
    }

    await this.setItemStorage(AppStorage.LOCKED_FUND, JSON.stringify(lockedFund));
  }

  async saveAllLockedFund(lockedFund) {
    await this.setItemStorage(AppStorage.LOCKED_FUND, JSON.stringify(lockedFund));
  }

  async removeAllLockedFund() {
    await this.setItemStorage(AppStorage.LOCKED_FUND, JSON.stringify({}));
  }

  async removeNamespaceLockedFund(namespaceId) {
    let lockedFund = await this.getLockedFund();
    const keys = Object.keys(lockedFund);
    for (let k of keys) {
      if (lockedFund(k).namespaceId == namespaceId) {
        delete lockedFund[k];
      }
    }
    await this.setItemStorage(AppStorage.LOCKED_FUND, JSON.stringify(lockedFund));
  }

  splitIntoChunks(arr, chunkSize) {
    let groups = [];
    let i;
    for (i = 0; i < arr.length; i += chunkSize) {
      groups.push(arr.slice(i, i + chunkSize));
    }
    return groups;
  };

  async getMultiTxFromDisk(txids) {
    let result = {};
    let chunks = this.splitIntoChunks(txids, 50);
    for (ch of chunks) {
      let data = await AsyncStorage.multiGet(ch);
      if (!data) {
        continue;
      }
      for (let d of data) {
        result[d[0]] = JSON.parse(d[1]);
      }
    }
    return result;
  }

  async saveMultiTxToDisk(txs) {
    let chunks = this.splitIntoChunks(txs, 50);
    for (ch of chunks) {
      for (c of ch) {
        c[1] = JSON.stringify(c[1]);
      }
      await AsyncStorage.multiSet(ch);
    }
  }

  async clearTxs() {
    try {
      const keys = await this.MMKV.indexer.getKeys();
      for (let k of keys) {
        await this.MMKV.setStringAsync(k, '');
      }
    } catch (error) {
        console.log(error)
        console.error('Error clearing app data.');
    }
  }

  /**
   * For each wallet, fetches balance from remote endpoint.
   * Use getter for a specific wallet to get actual balance.
   * Returns void.
   * If index is present then fetch only from this specific wallet
   *
   * @return {Promise.<void>}
   */
  async fetchWalletBalances(index) {
    console.log('fetchWalletBalances for wallet#', index);
    if (index || index === 0) {
      let c = 0;
      for (let wallet of this.wallets.filter(wallet => wallet.type !== PlaceholderWallet.type)) {
        if (c++ === index) {
          await wallet.fetchBalance();
        }
      }
    } else {
      for (let wallet of this.wallets.filter(wallet => wallet.type !== PlaceholderWallet.type)) {
        await wallet.fetchBalance();
      }
    }
  }

  /**
   * Fetches from remote endpoint all transactions for each wallet.
   * Returns void.
   * To access transactions - get them from each respective wallet.
   * If index is present then fetch only from this specific wallet.
   *
   * @param index {Integer} Index of the wallet in this.wallets array,
   *                        blank to fetch from all wallets
   * @return {Promise.<void>}
   */
  async fetchWalletTransactions(index) {
    console.log('fetchWalletTransactions for wallet#', index);
    if (index || index === 0) {
      let c = 0;
      for (let wallet of this.wallets.filter(wallet => wallet.type !== PlaceholderWallet.type)) {
        if (c++ === index) {
          await wallet.fetchTransactions();
          if (wallet.fetchPendingTransactions) {
            await wallet.fetchPendingTransactions();
          }
          if (wallet.fetchUserInvoices) {
            await wallet.fetchUserInvoices();
          }
        }
      }
    } else {
      for (let wallet of this.wallets) {
        await wallet.fetchTransactions();
        if (wallet.fetchPendingTransactions) {
          await wallet.fetchPendingTransactions();
        }
        if (wallet.fetchUserInvoices) {
          await wallet.fetchUserInvoices();
        }
      }
    }
  }

  /**
   *
   * @returns {Array.<AbstractWallet>}
   */
  getWallets() {
    return this.wallets;
  }

  /**
   * Getter for all transactions in all wallets.
   * But if index is provided - only for wallet with corresponding index
   *
   * @param index {Integer|null} Wallet index in this.wallets. Empty (or null) for all wallets.
   * @param limit {Integer} How many txs return, starting from the earliest. Default: all of them.
   * @return {Array}
   */
  getTransactions(index, limit = Infinity) {
    if (index || index === 0) {
      let txs = [];
      let c = 0;
      for (let wallet of this.wallets) {
        if (c++ === index) {
          txs = txs.concat(wallet.getTransactions());
        }
      }
      return txs;
    }

    let txs = [];
    for (let wallet of this.wallets) {
      let walletTransactions = wallet.getTransactions();
      for (let t of walletTransactions) {
        t.walletPreferredBalanceUnit = wallet.getPreferredBalanceUnit();
      }
      txs = txs.concat(walletTransactions);
    }

    for (let t of txs) {
      t.sort_ts = +new Date(t.received);
    }

    return txs
      .sort(function(a, b) {
        return b.sort_ts - a.sort_ts;
      })
      .slice(0, limit);
  }

  /**
   * Getter for a sum of all balances of all wallets
   *
   * @return {number}
   */
  getBalance() {
    let finalBalance = 0;
    for (let wal of this.wallets) {
      finalBalance += wal.getBalance();
    }
    return finalBalance;
  }

  async isAdancedModeEnabled() {
    try {
      return !!(await this.getItem(AppStorage.ADVANCED_MODE_ENABLED));
    } catch (_) {}
    return false;
  }

  async setIsAdancedModeEnabled(value) {
    await this.setItem(AppStorage.ADVANCED_MODE_ENABLED, value ? '1' : '');
  }

  async isStatusEnabled() {
    try {
      return !!(await this.getItem(AppStorage.STATUS_ENABLED));
    } catch (_) {}
    return false;
  }

  async setIsStatusEnabled(value) {
    await this.setItem(AppStorage.STATUS_ENABLED, value ? '1' : '');
  }

  /**
   * Simple async sleeper function
   *
   * @param ms {number} Milliseconds to sleep
   * @returns {Promise<Promise<*> | Promise<*>>}
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
