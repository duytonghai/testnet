import * as dotenv from 'dotenv'
import { ethers } from 'ethers'
import * as zksync from 'zksync-web3'

dotenv.config()

const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
const AMOUNT = process.env.AMOUNT || '0.004'
const TO = process.env.TO || ''
const TX_COUNT = process.env.TX_COUNT || '72'
const TOKEN = process.env.TOKEN || ''

interface TransferInfo {
  to: string
  amount: ethers.BigNumberish
  token?: string
}

async function main() {
  const syncProvider = new zksync.Provider('https://zksync2-testnet.zksync.dev')

  const ethProvider = ethers.getDefaultProvider('goerli')

  const syncWallet = new zksync.Wallet(PRIVATE_KEY, syncProvider, ethProvider)

  const balanceTx = await syncWallet.getBalance()
  console.log('>>>>>Before transfer', ethers.utils.formatEther(balanceTx))

  for (let i = 0; i < parseInt(TX_COUNT); i++) {
    await transfer(syncWallet, TO)
  }

  const afterBalanceTx = await syncWallet.getBalance()
  console.log('>>>>>After transfer', ethers.utils.formatEther(afterBalanceTx))
}

function generateAmount(maxAmount: string) {
  const randomNumber = Math.floor(Math.random() * (10 - 1) + 1)

  // Transfer token with integer value, otherwise transfer ETH with decimal value
  let amount = TOKEN ? randomNumber : randomNumber / 1000

  if (parseFloat(amount.toString()) > parseFloat(maxAmount)) {
    amount = generateAmount(maxAmount)
  }
  return amount
}

async function transfer(from: zksync.Wallet, to: string) {
  const transferAmount = generateAmount(AMOUNT)
  const amount = ethers.utils.parseEther(transferAmount.toString())

  const txDetails: TransferInfo = {
    to,
    amount,
  }

  if (TOKEN) {
    txDetails.token = TOKEN
  }

  const tx = await from.transfer(txDetails)
  const receipt = await tx.wait()
  console.log('>>>>>>receipt,', to, transferAmount, receipt.transactionHash)
}

main()
  .then(() => process.exit(0))
  .catch((error: any) => {
    console.error(error)
    process.exit(1)
  })
