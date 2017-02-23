'use strict';

import test from 'ava';

test.cb('test spawn function simple with uname, assumes linux os', t=>{
  t.plan(3);
  const spawn = require('../index').spawn;
 
  const show = (stderr,stdout)=>{
    t.is('Linux\n',stdout);
  }

  const next = (err,code,signal)=>{
    t.is(0,code);
    t.is(null,signal);
    t.end();
  }

  spawn(`uname`,show,next,false);
});

test.cb('test spawn function with inputs', t=>{
  t.plan(3);
  const spawn = require('../index').spawn;
 
  const show = (stderr,stdout,string1,string2)=>{
    t.is('test',string1);
  }

  const next = (err,code,signal)=>{
    t.is(0,code);
    t.is(null,signal);
    t.end();
  }

  spawn(`ls -ltr`,show,next,false,'test');
});

test.cb('test spawn kill', t=>{
  t.plan(3);

  const spawn = require('../index').spawn;
  const timers = require('timers');

  let sp = null;

  let cnt = 0; 

  const show = (stderr,stdout)=>{
    if(cnt == 1) sp.kill('SIGTERM'); //after the first delay kill the script
    cnt++;
  }

  const next = (err,code,signal)=>{
    t.is(null,err);
    t.is(null,code);
    t.is('SIGTERM',signal);
    t.end();
  }
  sp = spawn(`find .`,show,next,false); //weird that the node process is still in package.json
});

test('test parse_command', t=>{
  const pc = require('../index').parse_command;

  let [testCmd,testArgs] = [null,null];
  let inCmd = null;
  let outCmd = null
  let outArgs = null;

  inCmd = `find --include -test "/test/dir space/" ./  *.js`;
  testCmd = 'find';
  testArgs = ['--include', '-test' ,'/test/dir space/','./','*.js'];
  
  [outCmd,outArgs] = pc(inCmd);
  t.is(outCmd,testCmd);
  for(let i of testArgs.keys()){
    t.is(outArgs[i],testArgs[i]);
  }
  t.is(outArgs.length, testArgs.length);


  inCmd = `find "/home/test\ /something" .js *js "*/\\.*" */\.*`;
  testCmd = 'find';
  testArgs = ['/home/test /something','.js', '*js', '*/\\.*', '*/\.*'];
  
  [outCmd,outArgs] = pc(inCmd);
  t.is(outCmd,testCmd);
  for(let i of testArgs.keys()){
    t.is(outArgs[i],testArgs[i]);
  }
  t.is(outArgs.length, testArgs.length);
});

test.cb('test exec command with ";"', t=>{
  t.plan(1);
  const exec = require('../index').exec;

  let command = 'echo "one"; echo "two"; echo "three"';
  let out = 'one\ntwo\nthree\n';

  const next = (err,stdout,stderr)=>{
    t.is(out,stdout);
    t.end();
  }
  exec(command,next,false);
});

test.cb('test exec command with kill', t=>{
  t.plan(1);
  const exec = require('../index').exec;

  let ex = null;

  const next = (err,stdout,stderr)=>{
    t.is(err.signal,'SIGTERM');
    t.end();
  }
  ex = exec('pwd ; cd ..; pwd; sleep 1; pwd',next,false);
  ex.kill('SIGTERM');
});

test.cb('test ping live machine', t=>{
  t.plan(1);
  const exec = require('../index').exec;

  const next = (err,stdout,stderr)=>{
    if(err){
      //console.log(`err: ${err.code} ${err.signal} ${err}`);
    }
    //console.log(`stdout ${stdout}`);
    //console.log(`stderr ${stderr}`);
    t.is(err,null);
    t.end();
  }
  exec('ping -c1 www.google.com -W1',next,false);
});

test.cb('testing redirection | ', (t)=>{
  const proc = require('../index');

  const show = (stderr,stdout)=>{
  }

  const next = (err,code,signal)=>{
    t.end();
  }
  proc.spawn(`ls -ltr | grep .js`,show,next,false);
});



