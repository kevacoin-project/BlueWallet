import bip39 from 'bip39';
import b58 from 'bs58check';
import { AbstractHDElectrumWallet } from './abstract-hd-electrum-wallet';
const bitcoin = require('bitcoinjs-lib');
const HDNode = require('bip32');
const loc = require('../loc');

//TODO: update for Kevacoin.
const ypub_VERSION      = '049d7cb2';
const ypub_VERSION_HEX  = 0x049d7cb2;

// To cache the seed returned by bip39.mnemonicToSeed,
// which take a long time.
let secretSeedCache = {};

/**
 * HD Wallet (BIP39).
 * In particular, BIP49 (P2SH Segwit)
 * @see https://github.com/bitcoin/bips/blob/master/bip-0049.mediawiki
 */
export class HDSegwitP2SHWallet extends AbstractHDElectrumWallet {
  static type = 'HDsegwitP2SH';
  static typeReadable = loc.wallets.list.hd_multi_address;

  allowSend() {
    return true;
  }

  allowSendMax(): boolean {
    return true;
  }

  /**
   * Get internal/external WIF by wallet index
   * @param {Boolean} internal
   * @param {Number} index
   * @returns {*}
   * @private
   */
  _getWIFByIndex(internal, index) {
    const mnemonic = this.secret;
    const cachedSeed = secretSeedCache[mnemonic];
    const seed = cachedSeed || bip39.mnemonicToSeed(mnemonic);
    if (!cachedSeed) {
      secretSeedCache[mnemonic] = seed;
    }
    const root = bitcoin.bip32.fromSeed(seed);
    const path = `m/49'/0'/0'/${internal ? 1 : 0}/${index}`;
    const child = root.derivePath(path);

    return bitcoin.ECPair.fromPrivateKey(child.privateKey).toWIF();
  }

  _getExternalAddressByIndex(index) {
    index = index * 1; // cast to int
    if (this.external_addresses_cache[index]) return this.external_addresses_cache[index]; // cache hit

    if (!this._node0) {
      const xpub = this.constructor._ypubToXpub(this.getXpub());
      const hdNode = HDNode.fromBase58(xpub);
      this._node0 = hdNode.derive(0);
    }
    const address = this.constructor._nodeToP2shSegwitAddress(this._node0.derive(index));

    return (this.external_addresses_cache[index] = address);
  }

  _getInternalAddressByIndex(index) {
    index = index * 1; // cast to int
    if (this.internal_addresses_cache[index]) return this.internal_addresses_cache[index]; // cache hit

    if (!this._node1) {
      const xpub = this.constructor._ypubToXpub(this.getXpub());
      const hdNode = HDNode.fromBase58(xpub);
      this._node1 = hdNode.derive(1);
    }
    const address = this.constructor._nodeToP2shSegwitAddress(this._node1.derive(index));

    return (this.internal_addresses_cache[index] = address);
  }

  /**
   * Returning ypub actually, not xpub. Keeping same method name
   * for compatibility.
   *
   * @return {String} ypub
   */
  getXpub() {
    if (this._xpub) {
      return this._xpub; // cache hit
    }
    // first, getting xpub
    const mnemonic = this.secret;
    const seed = bip39.mnemonicToSeed(mnemonic);
    const root = HDNode.fromSeed(seed);

    const path = "m/49'/0'/0'";
    const child = root.derivePath(path).neutered();
    const xpub = child.toBase58();

    // bitcoinjs does not support ypub yet, so we just convert it from xpub
    let data = b58.decode(xpub);
    data = data.slice(4);
    data = Buffer.concat([Buffer.from(ypub_VERSION, 'hex'), data]);
    this._xpub = b58.encode(data);

    return this._xpub;
  }

  _addPsbtInput(psbt, input, sequence, masterFingerprintBuffer) {
    const pubkey = this._getPubkeyByAddress(input.address);
    const path = this._getDerivationPathByAddress(input.address, 49);
    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey });
    let p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh });

    psbt.addInput({
      hash: input.txid,
      index: input.vout,
      sequence,
      bip32Derivation: [
        {
          masterFingerprint: masterFingerprintBuffer,
          path,
          pubkey,
        },
      ],
      witnessUtxo: {
        script: p2sh.output,
        value: input.amount || input.value,
      },
      redeemScript: p2wpkh.output,
    });

    return psbt;
  }

  /**
   * Converts ypub to xpub
   * @param {String} ypub - wallet ypub
   * @returns {*}
   */
  static _ypubToXpub(ypub) {
    let data = b58.decode(ypub);
    if (data.readUInt32BE() !== ypub_VERSION_HEX) throw new Error('Not a valid ypub extended key!');
    data = data.slice(4);

    //TODO: change it for Kevacoin.
    //data = Buffer.concat([Buffer.from('01ada464', 'hex'), data]);
    data = Buffer.concat([Buffer.from('0488b21e', 'hex'), data]);

    return b58.encode(data);
  }

  /**
   * Creates Segwit P2SH Kevacoin address
   * @param hdNode
   * @returns {String}
   */
  static _nodeToP2shSegwitAddress(hdNode) {
    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({ pubkey: hdNode.publicKey }),
    });
    return address;
  }

  allowHodlHodlTrading() {
    return true;
  }
}
