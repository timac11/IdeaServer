import WebServer from './webEndpoints/WebServer'
import NodeDatabase from './database/NodeDatabase'
import * as mqtt_cl from './mqtt/Mqtt_client'
import * as cron from 'node-cron'
import fetchMocks from './mockData/fetchDataFromAMIGO'
import config from "./config/config"

export default class Application {
  private readonly web: WebServer
  private readonly db: NodeDatabase
  private readonly mqtt: mqtt_cl.ClientMQTT

  constructor() {
    this.mqtt = new mqtt_cl.ClientMQTT()
    this.db = new NodeDatabase({
      'type': 'postgres',
      'host': config.hostDB,
      'port': config.portDB,
      'username': config.usernameDB,
      'password': config.passwordDB,
      'database': config.databaseName,
      'synchronize': true,
      'logging': false,
      'entities': [
        'dist/database/models/**/*.js'
      ]
    }, this.mqtt)
    this.web = new WebServer(config.serverPort, config.serverUrl, this.db)
  }

  fetchingData = async () => {
    const data = await fetchMocks('endpoint')
    await this.db.service.handleDataFromAMIGO(data)
    // await this.db.service.sendNewTransactionsToMQTT()
  }

  postData = async () => {
    await this.db.service.makePostRequest()
  }

  async start(): Promise<void> {
    await this.web.start()
    await this.db.initConnection()
    // await this.db.service.initMockData()
    const tmp = await this.db.service.cellRepository.find()
    if (!tmp.length) {
      // await this.db.service.fetchInitialDataFromAMIGO()
      // await this.db.service.initialDataForOperator()
      await this.db.service.initMockData()
    }
    this.mqtt.add_handler((value: string, message: string) => this.db.service.newTransactionStateFromMQTT(value, message))
    this.mqtt.start()
    // console.log("post data cron")
    // this.postData()
    //this.fetchingData()
    // await this.db.service.fetchDataFromAMIGO()
    // await this.db.service.sendNewTransactionsToMQTT()

    // const data = await fetchMocks('endpoint')
    // await this.db.service.handleDataFromAMIGO(data)

    cron.schedule('0 */15 * * * *', () => {
      console.log("fetch data cron")
      this.fetchingData()
    });
    cron.schedule("0 0 0 * * ?", () => {
      console.log("post data cron")
      this.postData()
    })
  }
}
