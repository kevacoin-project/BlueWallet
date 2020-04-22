module.exports = {
  _: {
    storage_is_encrypted: '你的資訊已經被加密， 請輸入密碼解密',
    enter_password: '輸入密碼',
    bad_password: '密碼無效，請重試',
    never: '不',
    continue: '繼續',
    ok: '好的',
  },
  wallets: {
    select_wallet: '選擇錢包',
    options: '選項',
    createBitcoinWallet: '您當前沒有bitcoin錢包. 為了支援閃電錢包, 我們需要建立或者匯入一個比特幣錢包. 是否需要繼續?',
    list: {
      app_name: 'KevaWallet',
      title: '錢包',
      header: '一個錢包代表一對的私鑰和地址' + '你可以通過分享收款.',
      add: '新增錢包',
      create_a_wallet: '建立一個錢包',
      create_a_wallet1: '建立錢包是免費的，你可以',
      create_a_wallet2: '想建立多少就建立多少個',
      latest_transaction: '最近的轉賬',
      empty_txs1: '你的轉賬資訊將展示在這裡',
      empty_txs2: '當前無資訊',
      empty_txs1_lightning:
        'Lightning wallet should be used for your daily transactions. Fees are unfairly cheap and speed is blazing fast.',
      empty_txs2_lightning: '\nTo start using it tap on "manage funds" and topup your balance.',
      tap_here_to_buy: '點選購買比特幣',
    },
    reorder: {
      title: '重新排列錢包',
    },
    add: {
      title: '新增錢包',
      description: '你可以掃描你的紙質備份錢包 (WIF格式), 或者建立一個新錢包. 預設支援隔離見證錢包',
      scan: '掃描',
      create: '建立',
      label_new_segwit: '新隔離見證(Segwit)',
      label_new_lightning: '新閃電',
      wallet_name: '錢包名稱',
      wallet_type: '類型',
      or: '或',
      import_wallet: '匯入錢包',
      imported: '已經匯入',
      coming_soon: '即將來臨',
      lightning: '閃電',
      bitcoin: '比特幣',
    },
    details: {
      title: '錢包',
      address: '地址',
      master_fingerprint: 'Master fingerprint',
      type: '類型',
      label: '標籤',
      destination: '目的',
      description: '描述',
      are_you_sure: '你確認麼?',
      yes_delete: '是的，刪除',
      no_cancel: '不，取消',
      delete: '刪除',
      save: '儲存',
      delete_this_wallet: '刪除這個錢包',
      export_backup: '匯出備份',
      buy_bitcoin: '購買比特幣',
      show_xpub: '展示錢包 XPUB',
    },
    export: {
      title: '錢包匯出',
    },
    xpub: {
      title: '錢包 XPUB',
      copiedToClipboard: '複製到貼上板.',
    },
    import: {
      title: '匯入',
      explanation: '輸入你的助記詞，私鑰或者WIF, 或者其他格式的資料. KevaWallet將盡可能的自動識別資料格式並匯入錢包',
      imported: '已經匯入',
      error: '匯入失敗，請確認你提供的資訊是有效的',
      success: '成功',
      do_import: '匯入',
      scan_qr: '或掃面二維碼',
    },
    scanQrWif: {
      go_back: '回退',
      cancel: '取消',
      decoding: '解碼中',
      input_password: '輸入密碼',
      password_explain: '這是一個BIP38加密的私鑰',
      bad_password: '密碼錯誤',
      wallet_already_exists: '當前錢包已經存在',
      bad_wif: 'WIF格式無效',
      imported_wif: 'WIF已經匯入',
      with_address: ' 地址為',
      imported_segwit: 'SegWit已經匯入',
      imported_legacy: 'Legacy已經匯入',
      imported_watchonly: '匯入只讀',
    },
  },
  transactions: {
    list: {
      tabBarLabel: '轉賬',
      title: '轉賬',
      description: '當前所有錢包的轉入和轉出記錄',
      conf: '配置',
    },
    details: {
      title: '轉賬',
      from: '輸入',
      to: '輸出',
      copy: '複製',
      transaction_details: '轉賬詳情',
      show_in_block_explorer: '區塊瀏覽器展示',
    },
  },
  send: {
    header: '傳送',
    details: {
      title: '建立交易',
      amount_field_is_not_valid: '金額格式無效',
      fee_field_is_not_valid: '費用格式無效',
      address_field_is_not_valid: '地址內容無效',
      total_exceeds_balance: '餘額不足',
      create_tx_error: '建立交易失敗. 請確認地址格式正確.',
      address: '地址',
      amount_placeholder: '傳送金額(in KVA)',
      fee_placeholder: '手續費用 (in KVA)',
      note_placeholder: '訊息',
      cancel: '取消',
      scan: '掃描',
      send: '傳送',
      create: '建立',
      remaining_balance: '剩餘金額',
    },
    confirm: {
      header: '確認',
      sendNow: '現在傳送',
    },
    success: {
      done: '完成',
    },
    create: {
      details: '詳情',
      title: '建立詳情',
      error: '建立交易失敗. 無效地址或金額?',
      go_back: '回退',
      this_is_hex: '這個是交易的十六進位制資料, 簽名並廣播到全網路.',
      to: '到',
      amount: '金額',
      fee: '手續費',
      tx_size: '交易大小',
      satoshi_per_byte: '蔥每byte',
      memo: '訊息',
      broadcast: '廣播',
      not_enough_fee: '手續費不夠，請增加手續費',
    },
  },
  receive: {
    header: '收款',
    details: {
      title: '分享這個地址給付款人',
      share: '分享',
      copiedToClipboard: '複製到貼上板.',
      label: '描述',
      create: '建立',
      setAmount: '收款金額',
    },
    scan_lnurl: 'Scan to receive',
  },
  buyBitcoin: {
    header: '購買比特幣',
    tap_your_address: '點選地址複製到貼上板:',
    copied: '複製到貼上板!',
  },
  settings: {
    header: '設定',
    plausible_deniability: '可否認性...',
    storage_not_encrypted: '儲存:未加密',
    storage_encrypted: '儲存:加密中',
    password: '密碼',
    password_explain: '建立你的加密密碼',
    retype_password: '再次輸入密碼',
    passwords_do_not_match: '兩次輸入密碼不同',
    encrypt_storage: '加密儲存',
    lightning_settings: '閃電網路設定',
    lightning_settings_explain: '如要要連線你自己的閃電節點請安裝LndHub' + ' 並把url地址輸入到下面. 空白將使用預設的LndHub (lndhub.io)',
    electrum_settings: 'Electrum Settings',
    electrum_settings_explain: 'Set to blank to use default',
    save: '儲存',
    about: '關於',
    language: '語言',
    currency: '貨幣',
    advanced_options: 'Advanced Options',
    enable_advanced_mode: 'Enable advanced mode',
  },
  plausibledeniability: {
    title: '可否認性',
    help:
      '在某些情況下, 你不得不暴露 ' +
      '密碼. 為了讓你的比特幣更加安全, KevaWallet可以建立一些 ' +
      '加密空間, 用不同的密碼. 在壓力之下, ' +
      '你可以暴露這個錢包密碼. 再次進入 ' +
      'KevaWallet, 我們會解鎖一些虛擬空間. 對第三方來說看上去' +
      '是合理的, 但會偷偷的幫你保證主錢包的安全 ' +
      '幣也就安全了.',
    help2: '新的空間具備完整的功能，你可以存在 ' + '少量的金額在裡面.',
    create_fake_storage: '建立虛擬加密儲存',
    go_back: '回退',
    create_password: '建立密碼',
    create_password_explanation: '虛擬儲存空間密碼不能和主儲存空間密碼相同',
    password_should_not_match: '虛擬儲存空間密碼不能和主儲存空間密碼相同',
    retype_password: '重輸密碼',
    passwords_do_not_match: '兩次輸入密碼不同，請重新輸入',
    success: '成功',
  },
  lnd: {
    title: '配置資金支援',
    choose_source_wallet: '選擇一個資金源錢包',
    refill_lnd_balance: '給閃電錢包充值',
    refill: '充值',
    withdraw: '提取',
    expired: '超時',
    placeholder: 'Invoice',
    sameWalletAsInvoiceError: '你不能用建立賬單的錢包去支付該賬單',
  },
  pleasebackup: {
    title: 'Your wallet is created...',
    text:
      "Please take a moment to write down this mnemonic phrase on a piece of paper. It's your backup you can use to restore the wallet on other device.",
    ok: 'OK, I wrote this down!',
  },
  lndViewInvoice: {
    wasnt_paid_and_expired: 'This invoice was not paid for and has expired',
    has_been_paid: 'This invoice has been paid for',
    please_pay: 'Please pay',
    sats: 'sats',
    for: 'For:',
    additional_info: 'Additional Information',
    open_direct_channel: 'Open direct channel with this node:',
  },
};
