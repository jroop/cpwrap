'use strict';

((exports)=>{
  /*
  Helper library wrapped around nodejs child_process exec and spawn
  for running the command line and scripts
  */
  const proc = require('child_process'); 
  
  let vb = false; //hold the print flag

  const print = (str)=>{
    //used to print on/off
    if(vb === true){
      console.log(str);
    } 
  }

  const parse_command = (command_line)=>{
    /*
    function to parse command line and return
    command,args[]
    */
    let args = command_line.match(/[*-.\/\w]+|"[^"]+"/g); //split except not between "" also need to escape \ with \\

    //strip off quotes
    for(let k of args.keys()){
      args[k] = args[k].replace(/"/g,'');
    }

    let command = args[0]; //set first item as the command
    args.splice(0,1); //remove the fist item

    return [command,args];
  }

  const exec = (command,next,verbose=false,...args)=>{
    //command can be space separated
    vb = verbose;

    let cmd = proc.exec(command,(err,stdout,stderr)=>{
      print(`stdout: ${stdout}`);
      print(`stderr: ${stderr}`);
      if(err){
        print(`err: ${err.code} ${err.signal} ${err}`);
      }
      next(err,stdout,stderr,...args); //callback signature
    });

    return cmd;
  }

  const spawn = (command_line,show,next,verbose=false,...args)=>{

    vb = verbose; //set printing

    //used to help protect against 'exit' firing after 'error' 
    //so only have one next handler
    let fireExit = true; 

    //used for calling linux command line functions
    let cmd = proc.spawn('sh',['-c', command_line]);

    //return intermediate results
    cmd.stdout.on('data',(stream)=>{
      print(`cmd.stdout.on: ${stream}`);
      show(null/*stderr*/, `${stream}`/*stdout*/,...args); 
    });

    cmd.stderr.on('data',(stream)=>{
      print(`cmd.stderr.on: ${stream}`);
      show(`${stream}`/*stderr*/, null/*stdout*/,...args); 
    });

    cmd.on('error',(err)=>{
      print(`cmd.on 'error': ${err}`);
      fireExit = false; //had an error so suppress exit next handler
      next(err /*err*/,null/*code*/,null/*signal*/,...args);
    });

    cmd.on('exit',(code,signal)=>{
      print(`cmd.on 'exit': ${code} ${signal}`);

      //will be false if had an error message
      if(fireExit){
        next(null/*err*/,code/*code*/,signal/*signal*/,...args);
      }
    });

    return cmd; //return spawn so can issue kill() and other commands to process 
  }

  exports.exec = exec;
  exports.spawn = spawn;
  exports.parse_command = parse_command;
})(typeof exports === 'undefined'? this['cpwrap']={}: exports);