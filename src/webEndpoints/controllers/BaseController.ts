import * as Router from 'koa-router'

export class BaseController {

  handler(value: string,message: string) : void {
  console.log("Receive new message %o ", value)
}

  public router(): Router {
    const router = new Router()
    const namespace = `/api`
    let mqtt_cl = require('../../mqtt/Mqtt_client')
    let excel = require('../../excel/xlsx')



    var workerpool  = require('workerpool');

// create a worker pool using an the asyncWorker. This worker contains
// asynchronous functions.
var pool = workerpool.pool('./src/workers/asyncWorker.js');


    /* configure endpoints
    */

    // example: remove after implementation
    router.get(`${namespace}/hello`, (ctx: Router.IRouterContext) => {


  // pool.proxy()
  //     .then((worker: any) => {
  //       return worker.asyncAdd(3, 4.1);
  //     })
  //     .then((result: any) => {
  //       console.log(result);
  //     })
  //     .catch((err: any) => {
  //       console.error(err);
  //     })
  //     .then(() => {
  //       pool.terminate(); // terminate all workers when done
  //     });


//  publishProgress(enode: number,contractID: number,amount: number, seller: string, contragent: string,delta: number)
    const mqtt = new mqtt_cl.ClientMQTT()
    mqtt.add_handler(this.handler)
    mqtt.start()
      this.setCorsHeaders(ctx)
      ctx.response.body = 'Hello!'
      excel.parse()
      mqtt.publishProgress(1,1,200,"Enode1","Enode2",12.5)
    })

    return router
  }

  setCorsHeaders (ctx: Router.IRouterContext) {
    ctx.response.set('Access-Control-Allow-Origin', '*')
    ctx.response.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    ctx.response.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, HEAD, OPTIONS')
    ctx.response.status = 200
  }
}
