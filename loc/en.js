module.exports = {
  _: {
    storage_is_encrypted: 'Your storage is encrypted. Password is required to decrypt it',
    enter_password: 'Enter password',
    bad_password: 'Wrong password, please try again.',
    never: 'never',
    continue: 'Continue',
    ok: 'OK',
    bad_network: "Connection error, please try again",
  },
  general: {
    cancel: 'Cancel',
    delete: 'Delete',
    close: 'Close',
    reply: 'Reply',
    reward: 'Reward',
    other_amount: 'Other Amount',
    reply_sent: 'Reply sent',
    reward_sent: 'Reward sent',
    share: 'Share',
    share_sent: 'Shared successfully',
    copiedToClipboard: 'Copied to clipboard',
    unconfirmed: 'Unconfirmed',
    label_wallets: 'Wallets',
    label_data: 'Data',
    label_settings: 'Settings',
    language_restart: 'After selecting a new language, restarting the app is required for the change to take effect.',
    balance: 'Balance',
    done: 'Done',
    video_too_big: 'File bigger than 30MB. Please trim or compress it.',
  },
  namespaces: {
    height: "block",
    my_data: "My Data",
    others: "Others",
    namespace_name: "Name of namespace",
    name: 'name',
    shortcode: "Short Code",
    shortcode_id: "Shortcode, namespace ID or #hashtag",
    no_data: "No Data",
    click_add_btn: "Enter name and click the '+' button to create your first namespace",
    click_search_btn: "Enter namespace shortcode (e.g. 5570511) and click the 'search' button to see other namespaces",
    explain: "A namespace is a data container where you can add key-value pairs",
    namespace_creation_err: 'Cannot create namespace. Please wait a few minutes until your last change is confirmed in the blockchain.',
    update_key_err: 'Cannot update or add key-value. Please wait a few minutes until your last change is confirmed in the blockchain.',
    delete_key_err: 'Cannot dete key. Please wait a few minutes until your last change is confirmed in the blockchain.',
    multiaddress_wallet: 'Only multiple-address wallet is supported.',
    creating_tx: 'Creating Transaction ...',
    please_wait: 'This will take about 10 seconds.',
    scanning_block: 'Fetching transactions:',
    refreshing: 'Refreshing data ...',
    default_share: 'A post from',
    namespace_unconfirmed: 'Namespace not confirmed yet',
    hide_namespace: 'Hide this namespace?',
    hide: 'Hide',
    no_wallet: 'Need a wallet with a balance',
    create_namespace_first: 'Create a namespace first',
    check_again: 'Check Again',
    pending_confirmation: 'Pending confirmation. This will take a few minutes. You can start adding content to your namespace.',
    confirmed: 'Namespace Confirmed',
    no_hashtag: 'Hashtag not found, please try other ones.',
    submit: 'Submit',
    title: 'Title',
    content: 'Content',
  },
  wallets: {
    select_wallet: 'Select Wallet',
    options: 'options',
    createBitcoinWallet:
      'You currently do not have a Kevacoin wallet. In order to fund a Lightning wallet, a Kevacoin wallet needs to be created or imported. Would you like to continue anyway?',
    list: {
      app_name: 'KevaWallet',
      title: 'Wallets',
      header: 'A wallet represents a pair of a secret (private key) and an address' + 'you can share to receive coins.',
      add: 'Add Wallet',
      create_a_wallet: 'Add a wallet',
      create_a_wallet1: "It's free and you can create",
      create_a_wallet2: 'as many as you like',
      create_a_button: 'Add now',
      latest_transaction: 'latest transaction',
      empty_txs1: 'Your transactions will appear here',
      empty_txs2: 'Start with your wallet',
      empty_txs1_lightning:
        'Lightning wallet should be used for your daily transactions. Fees are unfairly cheap and speed is blazing fast.',
      empty_txs2_lightning: '\nTo start using it tap on "manage funds" and topup your balance.',
      tap_here_to_buy: 'Tap here to buy Kevacoin',
      single_address: 'Single Address',
      hd_multi_address: 'HD Multi-Address',
    },
    reorder: {
      title: 'Reorder Wallets',
    },
    add: {
      title: 'add wallet',
      description:
        'You can either scan backup paper wallet (in WIF - Wallet Import Format), or create a new wallet. Segwit wallets supported by default.',
      scan: 'Scan',
      create: 'Create',
      label_new_segwit: 'New SegWit',
      label_new_lightning: 'New Lightning',
      wallet_name: 'name',
      wallet_type: 'type',
      or: 'or',
      import_wallet: 'Import wallet',
      imported: 'Imported',
      coming_soon: 'Coming soon',
      lightning: 'Lightning',
      bitcoin: 'Kevacoin',
      multi_address: 'Multiple addresses',
      single_address: 'Single address',
    },
    details: {
      title: 'Wallet',
      address: 'Address',
      master_fingerprint: 'Master fingerprint',
      type: 'Type',
      label: 'Label',
      destination: 'destination',
      description: 'description',
      are_you_sure: 'Are you sure?',
      yes_delete: 'Yes, delete',
      no_cancel: 'No, cancel',
      delete: 'Delete',
      save: 'Save',
      delete_this_wallet: 'Delete this wallet',
      export_backup: 'Export / backup',
      buy_bitcoin: 'Buy Kevacoin',
      show_xpub: 'Show wallet XPUB',
      connected_to: 'Connected to',
      advanced: 'Advanced',
      use_with_hardware_wallet: 'Use with hardware wallet',
    },
    export: {
      title: 'wallet export',
    },
    xpub: {
      title: 'wallet XPUB',
      copiedToClipboard: 'Copied to clipboard.',
    },
    import: {
      title: 'import',
      explanation:
        "Write here your mnemonic, private key, WIF, or anything you've got. KevaWallet will do its best to guess the correct format and import your wallet",
      imported: 'Imported',
      error: 'Failed to import. Please, make sure that the provided data is valid.',
      success: 'Success',
      do_import: 'Import',
      scan_qr: 'Scan or import a file',
    },
    scanQrWif: {
      go_back: 'Go Back',
      cancel: 'Cancel',
      decoding: 'Decoding',
      input_password: 'Input password',
      password_explain: 'This is BIP38 encrypted private key',
      bad_password: 'Bad password',
      wallet_already_exists: 'Such wallet already exists',
      bad_wif: 'Bad WIF',
      imported_wif: 'Imported WIF ',
      with_address: ' with address ',
      imported_segwit: 'Imported SegWit',
      imported_legacy: 'Imported Legacy',
      imported_watchonly: 'Imported Watch-only',
    },
  },
  transactions: {
    list: {
      tabBarLabel: 'Transactions',
      title: 'transactions',
      description: 'A list of ingoing or outgoing transactions of your wallets',
      conf: 'conf',
    },
    details: {
      title: 'Transaction',
      from: 'Input',
      to: 'Output',
      copy: 'Copy',
      transaction_details: 'Transaction details',
      show_in_block_explorer: 'View in block explorer',
    },
  },
  send: {
    header: 'Send',
    details: {
      title: 'create transaction',
      amount_field_is_not_valid: 'Amount field is not valid',
      fee_field_is_not_valid: 'Fee field is not valid',
      address_field_is_not_valid: 'Address field is not valid',
      total_exceeds_balance: 'The sending amount exceeds the available balance.',
      create_tx_error: 'There was an error creating the transaction. Please, make sure the address is valid.',
      address: 'address',
      amount_placeholder: 'amount to send (in BTC)',
      fee_placeholder: 'plus transaction fee (in BTC)',
      note_placeholder: 'note to self',
      cancel: 'Cancel',
      scan: 'Scan',
      send: 'Send',
      create: 'Create Invoice',
      remaining_balance: 'Remaining balance',
    },
    confirm: {
      header: 'Confirm',
      sendNow: 'Send now',
    },
    success: {
      done: 'Done',
    },
    create: {
      details: 'Details',
      title: 'create transaction',
      error: 'Error creating transaction. Invalid address or send amount?',
      go_back: 'Go Back',
      this_is_hex: `This is your transaction's hex, signed and ready to be broadcasted to the network.`,
      to: 'To',
      amount: 'Amount',
      fee: 'Fee',
      tx_size: 'TX size',
      satoshi_per_byte: 'Satoshi per byte',
      memo: 'Memo',
      broadcast: 'Broadcast',
      not_enough_fee: 'Not enough fee. Increase the fee',
    },
  },
  receive: {
    header: 'Receive',
    details: {
      title: 'Share this address with payer',
      share: 'share',
      copiedToClipboard: 'Copied to clipboard.',
      label: 'Description',
      create: 'Create',
      setAmount: 'Receive with amount',
    },
    scan_lnurl: 'Scan to receive',
  },
  buyBitcoin: {
    header: 'Buy Kevacoin',
    tap_your_address: 'Tap your address to copy it to clipboard:',
    copied: 'Copied to Clipboard!',
  },
  settings: {
    general: 'General',
    security: 'Security',
    header: 'Settings',
    plausible_deniability: 'Plausible deniability',
    storage_not_encrypted: 'Storage: not encrypted',
    storage_encrypted: 'Storage: encrypted',
    password: 'Password',
    password_explain: 'Create the password you will use to decrypt the storage',
    retype_password: 'Re-type password',
    passwords_do_not_match: 'Passwords do not match',
    encrypt_storage: 'Encrypt storage',
    lightning_settings: 'Lightning Settings',
    lightning_settings_explain:
      'To connect to your own LND node please install LndHub' +
      " and put its URL here in settings. Leave blank to use KevaWallet's LNDHub (lndhub.io). Wallets created after saving changes will connect to the specified LNDHub.",
    network: 'Network',
    electrum_settings: 'Electrum Settings',
    electrum_settings_explain: 'Set to blank to use default',
    electrum_restart: 'Your changes have been saved successfully. Restart may be required for changes to take effect.',
    save: 'Save',
    about: 'About',
    language: 'Language',
    currency: 'Currency',
    advanced_options: 'Advanced Options',
    enable_advanced_mode: 'Advanced mode',
    advanced_mode_note: 'When enabled, you will be able to view selected wallets, and transactions, using your other Apple iCloud connected devices.',
  },
  plausibledeniability: {
    title: 'Plausible Deniability',
    help:
      'Under certain circumstances, you might be forced to disclose a ' +
      'password. To keep your coins safe, KevaWallet can create another ' +
      'encrypted storage, with a different password. Under pressure, ' +
      'you can disclose this password to a 3rd party. If entered in ' +
      "KevaWallet, it will unlock a new 'fake' storage. This will seem " +
      'legit to a 3rd party, but it will secretly keep your main storage ' +
      'with coins safe.',
    help2: 'The new storage will be fully functional, and you can store some ' + 'minimum amounts there so it looks more believable.',
    create_fake_storage: 'Create Encrypted storage',
    go_back: 'Go Back',
    create_password: 'Create a password',
    create_password_explanation: 'Password for fake storage should not match the password for your main storage',
    password_should_not_match: 'Password is currently in use. Please, try a different password.',
    retype_password: 'Retype password',
    passwords_do_not_match: 'Passwords do not match, try again',
    success: 'Success',
  },
  lnd: {
    title: 'manage funds',
    choose_source_wallet: 'Choose a source wallet',
    refill_lnd_balance: 'Refill Lightning wallet balance',
    refill: 'Refill',
    withdraw: 'Withdraw',
    expired: 'Expired',
    placeholder: 'Invoice',
    sameWalletAsInvoiceError: 'You can not pay an invoice with the same wallet used to create it.',
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
