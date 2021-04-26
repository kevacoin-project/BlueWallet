import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
const BlueElectrum = require('../../BlueElectrum');
const StyleSheet = require('../../PlatformStyleSheet');
const KevaColors = require('../../common/KevaColors');
import { THIN_BORDER, timeConverter, toastError, getInitials, stringToColor } from "../../util";
import {
  parseSpecialKey,
  getSpecialKeyText,
} from '../../class/keva-ops';
import {
  validateOffer,
} from '../../class/nft-ops';
import {
  BlueNavigationStyle,
} from '../../BlueComponents';
import { Avatar, Button, Icon, } from 'react-native-elements';
const loc = require('../../loc');
import { connect } from 'react-redux';

const MAX_TIME = 3147483647;

class Reply extends React.Component {

  constructor(props) {
    super(props);
    this.state = { };
  }

  gotoShortCode = (shortCode) => {
    this.props.navigation.push('KeyValues', {
      namespaceId: null,
      shortCode,
      displayName: null,
      isOther: true,
    });
  }

  onAccept = (offerTx) => {
    const {price, desc, addr, shortCode} = this.props;
    this.props.navigation.push('AcceptNFT', {
      shortCode,
      offerTx,
      price,
      desc,
      addr,
    });
  }

  render() {
    let {item, isOther} = this.props;
    const displayName = item.sender.displayName;
    let offerValue = item.offerPrice;

    return (
      <View style={styles.reply}>
        <View style={styles.senderBar} />
        <View style={{flex: 1}}>
          <View style={{flexDirection: 'row', justifyContent: "space-between"}}>
            <Text style={styles.replyValue} selectable={true}>{offerValue + ' KVA'}</Text>
            {(offerValue > 0 && !isOther) &&
              <Button
                type='outline'
                buttonStyle={{margin: 5, borderRadius: 30, height: 28, width: 90, borderColor: KevaColors.actionText}}
                title={"Accept"}
                titleStyle={{fontSize: 14, color: KevaColors.actionText, marginLeft: 4}}
                icon={
                  <Icon
                    name="check"
                    size={18}
                    color={KevaColors.actionText}
                  />
                }
                onPress={()=>{this.onAccept(item.value)}}
              />
            }
          </View>
          <View style={{flexDirection: 'row', marginTop: 5}}>
            <Avatar rounded size="small"
              title={getInitials(displayName)}
              containerStyle={{backgroundColor: stringToColor(displayName), marginRight: 5}}
              onPress={() => this.gotoShortCode(item.sender.shortCode)}
            />
            <Text style={styles.sender} numberOfLines={1} ellipsizeMode="tail" onPress={() => this.gotoShortCode(item.sender.shortCode)}>
              {displayName + ' '}
            </Text>
            <TouchableOpacity onPress={() => this.gotoShortCode(item.sender.shortCode)} style={{alignSelf: 'center'}}>
              <Text style={styles.shortCodeReply}>
                {`@${item.sender.shortCode}`}
              </Text>
            </TouchableOpacity>
          </View>
          {(item.height > 0) ?
            <Text style={styles.timestampReply}>{timeConverter(item.time) + ' ' + item.height}</Text>
            :
            <Text style={styles.timestampReply}>{loc.general.unconfirmed}</Text>
          }
        </View>
      </View>
    )
  }
}

class BuyNFT extends React.Component {

  constructor() {
    super();
    this.state = {
      isRefreshing: false,
      key: '',
      value: '',
      isRaw: false,
      CIDHeight: 1,
      CIDWidth: 1,
      showPicModal: false,
      thumbnail: null,
      opacity: 0,
      replyCount: 0,
      replies: [],
    };
  }

  static navigationOptions = ({ navigation }) => ({
    ...BlueNavigationStyle(),
    title: '',
    tabBarVisible: false,
  });

  maybeHTML = value => {
    return /<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(value);
  }

  sortReplies = replies => {
    if (!replies) {
      return;
    }
    return replies.sort((a, b) => {
      const btime = b.time || MAX_TIME;
      const atime = a.time || MAX_TIME;
      return (btime - atime)
    });
  }

  async componentDidMount() {
    const {keyValueList} = this.props;
    const {shortCode, displayName, namespaceId, index, type, hashtags, price, addr, desc} = this.props.navigation.state.params;
    this.setState({
      shortCode, displayName, namespaceId, index, type, price, addr, desc
    });
    await this.fetchReplies();
  }

  componentWillUnmount () {
    if (this.subs) {
      this.subs.forEach(sub => sub.remove());
    }
  }

  showModal = () => {
    this.setState({showPicModal: true});
    StatusBar.setHidden(true);
  }

  closeModal = () => {
    StatusBar.setHidden(false);
    this.setState({showPicModal: false});
  }

  onLoadStart = () => {
    this.setState({opacity: 1});
  }

  onLoad = () => {
    this.setState({opacity: 0});
  }

  onBuffer = ({isBuffering}) => {
    this.setState({opacity: isBuffering ? 1 : 0});
  }

  onHashtag = hashtag => {
    const {navigation, dispatch} = this.props;
    navigation.push('HashtagKeyValues', {hashtag});
  }

  updateReplies = (reply) => {
    const {index, type, hashtags, updateHashtag} = this.props.navigation.state.params;
    let currentLength = this.state.replies.length;
    this.setState({
      replies: [reply, ...this.state.replies]
    });

    if (type == 'hashtag' && updateHashtag) {
      let keyValue = hashtags[index];
      keyValue.replies = currentLength + 1;
      updateHashtag(index, keyValue);
    }
  }

  onOffer = () => {
    const {navigation, namespaceList} = this.props;
    const {replyTxid, namespaceId, index, type, hashtags, price, desc, addr, displayName, profile} = navigation.state.params;
    // Must have a namespace.
    if (Object.keys(namespaceList).length == 0) {
      toastError('Create a namespace first');
      return;
    }

    navigation.navigate('OfferNFT', {
      replyTxid,
      namespaceId,
      index,
      type,
      displayName,
      price, desc, addr, profile, // NFT related.
      //updateReplies: this.updateReplies,
      //hashtags,
    })
  }

  onCancelSale = () => {
    // Cancel the sale.
  }

  fetchReplies = async () => {
    const {dispatch, navigation, keyValueList, reactions} = this.props;
    const {replyTxid, namespaceId, index, type, hashtags, price, addr} = navigation.state.params;

    try {
      this.setState({isRefreshing: true});
      const results = await BlueElectrum.blockchainKeva_getKeyValueReactions(replyTxid);
      const totalReactions = results.result;
      /*
        totalReactions format:
        {
          "key": "<key>",
          "value": "<value>",
          "displayName": <>,
          "shortCode": <>,
          "likes": <likes>,
          "replies": [{
            "height": <>,
            "key": <>,
            "value": <>,
            "time": <>,
            "sender": {
              shortCode: <>,
              displayName: <>
            }
          }],
          "shares": <shares>
          ...
        }
      */
      // Decode replies base64
      const replies = totalReactions.replies.map(r => {
        r.value = Buffer.from(r.value, 'base64');
        r.offerPrice = validateOffer(r.value, addr, price);
        return r;
      });

      const sortedReplies = replies.sort((a, b) => (b.offerPrice - a.offerPrice));
      this.setState({replies: sortedReplies});

      /*
      // Check if it is a favorite.
      const reaction = reactions[replyTxid];
      const favorite = reaction && !!reaction['like'] && totalReactions.likes > 0;

      // Update the replies, shares and favorite.
      if (type == 'keyvalue') {
        const keyValues = keyValueList.keyValues[namespaceId];
        let keyValue = keyValues[index];
        keyValue.favorite = favorite;
        keyValue.likes = totalReactions.likes;
        keyValue.shares = totalReactions.shares;
        keyValue.replies = totalReactions.replies.length;
        dispatch(setKeyValue(namespaceId, index, keyValue));
      } else if (type == 'hashtag') {
        let keyValue = hashtags[index];
        keyValue.favorite = favorite;
        keyValue.likes = totalReactions.likes;
        keyValue.shares = totalReactions.shares;
        keyValue.replies = totalReactions.replies.length;
        const newHashtags = [...hashtags];
        newHashtags[index] = keyValue;
        this.setState({
          hashtags: newHashtags,
        });
      }
      */

      this.setState({
        isRefreshing: false
      });
    } catch(err) {
      console.warn(err);
      this.setState({isRefreshing: false});
      toastError('Cannot fetch replies');
    }
  }

  gotoShortCode = (shortCode) => {
    this.props.navigation.push('KeyValues', {
      namespaceId: null,
      shortCode,
      displayName: null,
      isOther: true,
    });
  }

  render() {
    const {keyValueList} = this.props;
    const {hashtags, price, addr, desc, isOther} = this.props.navigation.state.params;
    let {replies} = this.state;
    const {shortCode, displayName, namespaceId, index, type} = this.state;
    if (!type) {
      return null;
    }

    let keyValue;
    if (type == 'keyvalue') {
      keyValue = (keyValueList.keyValues[namespaceId])[index];
    } else if (type == 'hashtag') {
      keyValue = hashtags[index];
    }

    const key = keyValue.key;
    let displayKey = key;
    const {keyType} = parseSpecialKey(key);
    if (keyType) {
      displayKey = getSpecialKeyText(keyType);
    }

    const listHeader = (
      <View style={styles.container}>
        <View style={styles.keyContainer}>
          <View style={{paddingRight: 10}}>
            <Avatar rounded size="medium" title={getInitials(displayName)}
              containerStyle={{backgroundColor: stringToColor(displayName)}}
              onPress={() => this.gotoShortCode(shortCode)}
            />
          </View>
          <View style={{paddingRight: 10, flexShrink: 1}}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.sender} numberOfLines={1} ellipsizeMode="tail" onPress={() => this.gotoShortCode(shortCode)}>
                {displayName + ' '}
              </Text>
              <TouchableOpacity onPress={() => this.gotoShortCode(shortCode)}>
                <Text style={styles.shortCode}>
                  {`@${shortCode}`}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.key} selectable>{"For Sale"}</Text>
          </View>
        </View>
        <View style={styles.valueContainer}>
          <Text style={{fontSize: 18, marginBottom: 10, color: KevaColors.darkText}}>
              {"Asking Price: "}
            <Text style={{fontSize: 18, marginBottom: 10, color: KevaColors.darkText, fontWeight: '700'}}>
              {price + ' KVA'}
            </Text>
          </Text>
          <Text style={{fontSize: 16, color: KevaColors.darkText}}>{desc}</Text>
        </View>
        <View style={styles.actionContainer}>
          <View style={{flexDirection: 'row'}}>
            {
              isOther ?
              <Button
                type='solid'
                buttonStyle={{borderRadius: 30, height: 30, width: 120, marginVertical: 5, borderColor: KevaColors.actionText, backgroundColor: KevaColors.actionText}}
                title={"Make an Offer"}
                titleStyle={{fontSize: 14, color: '#fff'}}
                onPress={()=>{this.onOffer()}}
              />
              :
              <Button
                type='outline'
                buttonStyle={{borderRadius: 30, height: 30, width: 120, marginVertical: 5, borderColor: KevaColors.actionText}}
                title={"Cancel Sale"}
                titleStyle={{fontSize: 14, color: KevaColors.actionText, marginLeft: 5}}
                onPress={()=>{this.onCancelSale()}}
                icon={
                  <Icon
                    name="close"
                    size={18}
                    color={KevaColors.actionText}
                  />
                }
              />
            }
          </View>
        </View>
      </View>
    );
    return (
      <FlatList
        style={styles.listStyle}
        ListHeaderComponent={listHeader}
        removeClippedSubviews={false}
        contentContainerStyle={{paddingBottom: 100}}
        data={replies}
        onRefresh={() => this.fetchReplies()}
        refreshing={this.state.isRefreshing}
        keyExtractor={(item, index) => item.key + index}
        renderItem={({item, index}) => <Reply item={item} price={price} addr={addr} shortCode={shortCode} isOther={isOther} navigation={this.props.navigation} />}
      />
    )
  }

}

function mapStateToProps(state) {
  return {
    keyValueList: state.keyValueList,
    namespaceList: state.namespaceList,
    mediaInfoList: state.mediaInfoList,
    reactions: state.reactions,
  }
}

export default BuyNFTScreen = connect(mapStateToProps)(BuyNFT);

var styles = StyleSheet.create({
  container: {
    backgroundColor: KevaColors.background,
  },
  keyContainer: {
    marginVertical: 10,
    borderWidth: THIN_BORDER,
    borderColor: KevaColors.cellBorder,
    backgroundColor: '#fff',
    padding: 10,
    flexDirection: 'row',
  },
  key: {
    fontSize: 16,
    fontWeight: '700',
    color: KevaColors.darkText,
    flex: 1,
    flexWrap: 'wrap',
  },
  value: {
    fontSize: 16,
    color: KevaColors.darkText,
    lineHeight: 25,
  },
  valueContainer: {
    marginTop: 2,
    borderWidth: THIN_BORDER,
    borderColor: KevaColors.cellBorder,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 18,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: THIN_BORDER,
    borderColor: KevaColors.cellBorder,
    backgroundColor: '#fff',
    padding: 10,
    paddingVertical: 15,
  },
  shareIcon: {
    color: KevaColors.arrowIcon,
    paddingLeft: 15,
    paddingRight: 2,
    paddingVertical: 2
  },
  actionIcon: {
    color: KevaColors.arrowIcon,
    paddingHorizontal: 15,
    paddingVertical: 2
  },
  rawIcon: {
    color: KevaColors.actionText,
    paddingHorizontal: 15,
    paddingVertical: 2
  },
  count: {
    color: KevaColors.arrowIcon,
    paddingVertical: 2
  },
  reply: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor:'#fff',
    borderBottomWidth: THIN_BORDER,
    borderColor: KevaColors.cellBorder,
  },
  replyValue: {
    fontSize: 18,
    color: KevaColors.darkText,
    paddingVertical: 8,
    lineHeight: 25,
    fontWeight: '700',
  },
  timestamp: {
    color: KevaColors.extraLightText,
    alignSelf: 'center',
    fontSize: 13,
  },
  timestampReply: {
    color: KevaColors.extraLightText,
    alignSelf: 'flex-start',
    fontSize: 13,
  },
  sender: {
    fontSize: 16,
    color: KevaColors.darkText,
    alignSelf: 'center',
    maxWidth: 220,
  },
  shortCode: {
    fontSize: 16,
    fontWeight: '700',
    color: KevaColors.actionText,
  },
  shortCodeReply: {
    fontSize: 16,
    fontWeight: '700',
    color: KevaColors.actionText,
  },
  senderBar: {
    borderLeftWidth: 4,
    borderColor: KevaColors.cellBorder,
    width: 0,
    paddingLeft: 3,
    paddingRight: 7,
    height: '100%',
  },
  shareContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: THIN_BORDER,
    borderColor: KevaColors.cellBorder,
    borderRadius: 12,
    margin: 10,
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIndicator: {
    position: 'absolute',
    top: 70,
    left: 70,
    right: 70,
    height: 50,
  },
  htmlText: {
    fontSize: 16,
    color: KevaColors.darkText,
    lineHeight: 23
  },
  htmlLink: {
    fontSize: 16,
    color: KevaColors.actionText,
    lineHeight: 23
  }
});