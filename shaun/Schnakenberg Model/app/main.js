/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * WEBGL 2.0    :   SCHNAKENBERG  MODEL
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN, SHAUN EISNER
 * DATE         :   Thu 28 Sep 2017 11:33:48 AM EDT
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
define([    'require',
            'shader!vertShader.vert',
            'shader!initShader.frag',
            'shader!compShader.frag',
            'shader!paceShader.frag',
            'shader!clickShader.frag',
            'shader!bvltShader.frag',
            'Abubu/Abubu'
            ],
function(   require,
            vertShader,
            initShader,
            compShader,
            paceShader,
            clickShader,
            bvltShader,
            Abubu
            ){
"use strict" ;

/*========================================================================
 * Global Parameters
 *========================================================================
 */
var log = console.log ;
var params ;
var env ;
var gui ;
var pan ;
/*========================================================================
 * createGui
 *========================================================================
 */
function createGui(){
    env.gui = new Abubu.Gui() ;
    gui = env.gui.addPanel({width:300}) ;
/*-------------------------------------------------------------------------
 * Model Parameters
 *-------------------------------------------------------------------------
 */
    gui.mdlPrmFldr  =   gui.addFolder( 'Model Parameters'   ) ;

    addCoeficients( gui.mdlPrmFldr, [
                        'Dx',
                        'Dy',
                        'a',
                        'b',
                        'p',
                        'dx',
                    ] ,
                    [env.comp1,env.comp2 ], {
                        step: 0.001,
                        callback: function(){env.nc.run(); }
                    } ) ;
    gui.mdlPrmFldr.open() ;

/*------------------------------------------------------------------------
 * Solver Parameters
 *------------------------------------------------------------------------
 */
    gui.slvPrmFldr  = gui.addFolder( 'Solver Parameters' ) ;
    gui.slvPrmFldr.add( env, 'dt').name('Delta t').onChange(
         function(){
            Abubu.setUniformInSolvers('dt', env.dt,
                    [env.comp1,env.comp2 ]) ;
         }
    );
    gui.slvPrmFldr.add( env, 'width').name( 'x-resolution' )
    .onChange( function(){
        Abubu.resizeRenderTargets(
                [env.fuv,env.suv], env.width, env.height);
    } ) ;

    gui.slvPrmFldr.add( env, 'height').name( 'y-resolution' )
    .onChange( function(){
        Abubu.resizeRenderTargets(
            [
                env.fuv,
                env.suv
            ],
            env.width,
            env.height);
    } ) ;

    gui.slvPrmFldr.open() ;
/*------------------------------------------------------------------------
 * Display Parameters
 *------------------------------------------------------------------------
 */
    gui.dspPrmFldr  = gui.addFolder( 'Display Parameters' ) ;
    gui.dspPrmFldr.add( env, 'colormap', Abubu.getColormapList() )
                .onChange(  function(){
                                env.disp.setColormap(env.colormap);
                                refreshDisplay() ;
                            }   ).name('Colormap') ;

    gui.dspPrmFldr.add( env, 'probeVisiblity').name('Probe Visiblity')
        .onChange(function(){
            env.disp.setProbeVisiblity(env.probeVisiblity);
            refreshDisplay() ;
        } ) ;
    gui.dspPrmFldr.add(env, 'minValue').onChange( function(){
            env.disp.setMinValue(env.minValue);
            refreshDisplay();
        } ) ;
    gui.dspPrmFldr.add(env, 'maxValue').onChange( function(){
            env.disp.setMaxValue(env.maxValue);
            refreshDisplay();
        } ) ;

    gui.dspPrmFldr.nclimits = gui.dspPrmFldr.addFolder( 'Nullcline Plot') ;
    gui.dspPrmFldr.nclimits.add(env, 'xmin').name('u-min').onChange( function(){
            env.nc.plt.xlimits = [env.xmin,env.xmax] ;
            env.nc.run() ;
            refreshDisplay();
        } ) ;
    gui.dspPrmFldr.nclimits.add(env, 'xmax').name('u-max').onChange( function(){
            env.nc.plt.xlimits = [env.xmin,env.xmax] ;
            env.nc.run() ;
            refreshDisplay();
        } ) ;
    gui.dspPrmFldr.nclimits.add(env, 'ymin').name('v-min').onChange( function(){
            env.nc.plt.ylimits = [env.ymin,env.ymax] ;
            env.nc.run() ;
            refreshDisplay();
        } ) ;
    gui.dspPrmFldr.nclimits.add(env, 'ymax').name('v-max').onChange( function(){
            env.nc.plt.ylimits = [env.ymin,env.ymax] ;
            env.nc.run() ;
            refreshDisplay();
        } ) ;
    gui.dspPrmFldr.add( env, 'frameRate').name('Frame Rate Limit')
        .min(60).max(40000).step(60)

   // gui.dspPrmFldr.add( env, 'timeWindow').name('Signal Window [ms]')
   // .onChange( function(){
   //     env.plot.updateTimeWindow(env.timeWindow) ;
   //     refreshDisplay() ;
   // } ) ;

/*------------------------------------------------------------------------
 * tipt
 *------------------------------------------------------------------------
 */
    gui.tptPrmFldr = gui.dspPrmFldr.addFolder( 'Tip Trajectory') ;
    gui.tptPrmFldr.add( env, 'tiptVisiblity' )
        .name('Plot Tip Trajectory?')
        .onChange(function(){
            env.disp.setTiptVisiblity(env.tiptVisiblity) ;
            refreshDisplay() ;
        } ) ;
    gui.tptPrmFldr.add( env, 'tiptThreshold').name( 'Threshold [mv]')
        .onChange( function(){
                env.disp.setTiptThreshold( env.tiptThreshold ) ;
                } ) ;
  //  gui.tptPrmFldr.open() ;

  //  gui.dspPrmFldr.open() ;

/*------------------------------------------------------------------------
 * save
 *------------------------------------------------------------------------
 */
    var svePrmFldr = gui.addFolder('Save Canvases') ;
    svePrmFldr.add( env, 'savePlot2DPrefix').name('File Name Prefix') ;
    svePrmFldr.add( env, 'savePlot2D' ).name('Save Plot2D') ;
/*------------------------------------------------------------------------
 *
 *------------------------------------------------------------------------
 */
    gui.click = gui.addFolder( "Click Info" ) ;
    gui.click.add( env,  'setV').name('Set v?').onChange(function(){
        env.click.uniforms.setV.value = env.setV ;
    });
    gui.click.add(env,  'v').name('v value').onChange(function(){
        env.click.uniforms.v.value = env.v ;
        env.nc.run() ;
    } ) ;
    gui.click.add( env,  'setW').name('Set u?').onChange(function(){
        env.click.uniforms.setW.value = env.setW ;
    });
    gui.click.add(env,  'w').name('u value').onChange(function(){
        env.click.uniforms.w.value = env.w ;
        env.nc.run() ;
    } ) ;

    gui.click.add( env,  'clickRadius' )
        .min(0.01).max(1.0).step(0.01)
        .name('Click Radius')
        .onChange(function(){
                env.click.uniforms.clickRadius.value = env.clickRadius ;
        } ) ;

    gui.click.open() ;
/*------------------------------------------------------------------------
 * Simulation
 *------------------------------------------------------------------------
 */
    gui.smlPrmFldr  = gui.addFolder(    'Simulation'    ) ;
    gui.smlPrmFldr.add( env, 'time').name('Solution Time [ms]').listen() ;

    gui.smlPrmFldr.add( env, 'initialize').name('Initialize') ;
    gui.smlPrmFldr.add( env, 'solve').name('Solve/Pause') ;
    gui.smlPrmFldr.open() ;

/*------------------------------------------------------------------------
 * addCoeficients
 *------------------------------------------------------------------------
 */
    function addCoeficients( fldr,
            coefs,
            solvers ,
            options ){
        var coefGui = {} ;
        var min = undefined ;
        var max = undefined ;
        var step = undefined ;
        var callback = undefined ;
        if (options != undefined ){
            if (options.min != undefined ){
                min = options.min ;
            }
            if (options.max != undefined ){
                max = options.max ;
            }
            if (options.step !=undefined ){
                step = options.step ;
            }
            if (options.callback != undefined){
                callback = options.callback ;
            }
        }
        for(var i=0; i<coefs.length; i++){
            var coef = addCoef(fldr,coefs[i],solvers, callback) ;
            if (min != undefined ){
                coef.min(min) ;
            }
            if (max != undefined ){
                coef.max(max) ;
            }
            if (step != undefined){
                coef.step(step) ;
            }
            coefGui[coefs[i]] = coef ;
        }
        return coefGui ;

        /* addCoef */
        function addCoef( fldr,
                coef,
                solvers,
                callback ){
            var coefGui  ;
            if (callback != undefined ){
                coefGui =   fldr.add( env, coef )
                .onChange(
                        function(){
                        callback() ;
                        Abubu.setUniformInSolvers(  coef,
                                env[coef],
                                solvers  ) ;
                        } ) ;

            }else{
            coefGui =   fldr.add( env, coef )
                .onChange(
                        function(){
                        Abubu.setUniformInSolvers(  coef,
                                env[coef],
                                solvers  ) ;
                        } ) ;
            }
            return coefGui ;

        }
    }

    return ;
} /* End of createGui */

/*========================================================================
 * Environment
 *========================================================================
 */
function Environment(){
    this.running = false ;

    /* Model Parameters         */
    this.Dx = 0  ;
    this.Dy = 1 ;
    this.a  = 0.1 ;
    this.b  = 0.43 ;
    this.p  = 2. ;
    /* Display Parameters       */
    this.colormap    =   'rainbowHotSpring';
    this.dispWidth   =   512 ;
    this.dispHeight  =   512 ;
    this.minValue    =   0. ;
    this.maxValue    =   3.0 ;
    this.frameRate   =   2400 ;
    this.timeWindow  =   1000 ;
    this.xmin = 0. ;
    this.xmax = 5 ;
    this.ymin = 0. ;
    this.ymax = 5 ;
    this.probeVisiblity = false ;

    this.tiptVisiblity= false ;
    this.tiptThreshold=  .5 ;
    this.tiptColor    = "#FFFFFF";

    /* Solver Parameters        */
    this.width       =   750 ;
    this.height      =   750 ;
    this.dt          =   1.e-3 ;
    this.cfl         =   1.0 ;
    this.dx          =   1.0 ;

    /* Autopace                 */
    this.pacing      = false ;
    this.pacePeriod  = 300 ;
    this.autoPaceRadius= 0.01 ;

    /* Solve                    */
    this.solve       = function(){
        this.running = !this.running ;
        return ;
    } ;
    this.time        = 0.0 ;

/*------------------------------------------------------------------------
 * click info
 *------------------------------------------------------------------------
 */
    this.setV = true ;
    this.setW = true ;
    this.v    = 3.0 ;
    this.w    = 0.0 ;

/*------------------------------------------------------------------------
 * autobreak
 *------------------------------------------------------------------------
 */
    this.autoBreakThreshold = -40 ;
    this.ry          = 0.5 ;
    this.lx          = 0.5 ;
    this.autobreak   = true ;

    this.autostop    = false;
    this.autostopInterval = 300 ;

/*------------------------------------------------------------------------
 * save info
 *------------------------------------------------------------------------
 */
    this.savePlot2DPrefix = '' ;
    this.savePlot2D    = function(){
        this.running = false ;
        var prefix ;
        try{
            prefix = eval(env.savePlot2DPrefix) ;
        }catch(e){
            prefix = this.savePlot2DPrefix ;
        }
        Abubu.saveCanvas( 'canvas_1',
        {
            number  : this.time ,
            postfix : '_'+this.colormap ,
            prefix  : prefix,
            format  : 'png'
        } ) ;
    }

    /* Clicker                  */
    this.clickRadius     = 0.1 ;
    this.clickPosition   = [0.5,0.5] ;
    this.conductionValue = [6.,0,0,0] ;
    this.paceValue       = [1.,0,0,0] ;
}


/*========================================================================
 * Initialization of the GPU and Container
 *========================================================================
 */
function loadWebGL()
{
    var canvas_1 = document.getElementById("canvas_1") ;
    var canvas_2 = document.getElementById("canvas_2") ;

    env = new Environment() ;
    env.canvas_1 =  canvas_1 ;

/*-------------------------------------------------------------------------
 * stats
 *-------------------------------------------------------------------------
 */
    var stats       = new Stats() ;
    document.body.appendChild( stats.domElement ) ;


/*-------------------------------------------------------------------------
 * setting up nulcline plots
 *-------------------------------------------------------------------------
 */
    var nc  = {} ;
    env.nc = nc ;
    nc.plt = new Plot(canvas_2) ;
    nc.plt.margins.left=60 ;
    nc.plt.margins.right = 20 ;
    nc.plt.margins.top = 10 ;
    nc.plt.xlabel = 'u' ;
    nc.plt.ylabel = 'v' ;
    nc.plt.xticks.precision = 1 ;
    nc.plt.yticks.precision = 1 ;
    nc.plt.xticks.noDivs = 6 ;
    nc.plt.yticks.noDivs = 12 ;
    nc.plt.xlimits = [env.xmin,env.xmax] ;
    nc.plt.ylimits = [env.ymin,env.ymax] ;
    nc.plt.grid = 'on' ;
    nc.plt.legend = 'on' ;
    nc.plt.legend.location = [canvas_2.width-150, 20] ;
    nc.plt.title = 'Nullclines Plot' ;

    nc.plt.init() ;
    nc.crv1 = nc.plt.addCurveFromPoints() ;
    nc.crv1.name = 'u-nullcline' ;
    nc.crv2 = nc.plt.addCurveFromPoints() ;
    nc.crv2.name = "v-nullcline" ;
    nc.crv3 = nc.plt.addCurveFromPoints() ;
    nc.crv3.name = 'Trajectory' ;

    nc.run = function(){
        nc.v = env.v ;
        nc.w = env.w ;
        nc.plt.reset() ;
        for(var u=nc.plt.xlimits[0]; u<nc.plt.xlimits[1] ; u+=0.01){
            var v = (-env.a + u)/(u**env.p);
            nc.crv1.plot(u,v) ;
            v = env.b/(u**2) ;
            nc.crv2.plot(u,v) ;
        }

        var v ,w, h ;
        nc.crv3.plot(nc.w, nc.v) ;
        for( var t =0 ; t < 20 ; t+=env.dt){
            v =nc.v ; w =nc.w ;
            nc.dv = env.dt*(env.b - (w**2)*v) ;
            nc.dw = env.dt*(env.a - w + (w**env.p)*v) ;
            nc.v += nc.dv ;
            nc.w += nc.dw ;
            nc.crv3.plot(nc.w, nc.v) ;
        }
    }
    nc.onclick = function(e){
        env.v = e.y ;
        env.w = e.x ;
        env.click.uniforms.v.value = env.v ;
        if (env.w >= 0){
          env.click.uniforms.w.value = env.w ;
        }
        else{
          env.click.uniforms.w.value = 0. ;
        }
        env.nc.run() ;
        gui.click.updateDisplay() ;
    }
    nc.plt.addClickListener(nc.onclick) ;

    nc.run() ;
/*------------------------------------------------------------------------
 * defining all render targets
 *------------------------------------------------------------------------
 */
    env.fuv     = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.suv     = new Abubu.FloatRenderTarget(env.width, env.height) ;
/*------------------------------------------------------------------------
 * creating a table of random numbers
 *------------------------------------------------------------------------
 */
    env.tab     = new Float32Array(env.width*env.height*4.0) ;
    var p = 0 ;
    for(var i=0; i<env.width; i++){
        for(var j=0;j<env.height; j++){
            env.tab[p]   = 0.;
            env.tab[p+1] = 0.;
            env.tab[p+2] = 0.;
            env.tab[p+3] = 0.;
            p += 4 ;
        }
    }

    env.uv0 = new Abubu.Float32Texture(env.width, env.height, {data:env.tab}) ;

/*------------------------------------------------------------------------
 * init solver to initialize all textures
 *------------------------------------------------------------------------
 */
    env.init  = new Abubu.Solver( {
       fragmentShader  : initShader.value ,
       vertexShader    : vertShader.value ,
       uniforms : {
            uv0 : { type : 't' , value : env.uv0 } ,
            } ,
       renderTargets   : {
           outFuv    : { location : 0, target: env.fuv     } ,
           outSuv    : { location : 1, target: env.suv     } ,
       }
    } ) ;

/*------------------------------------------------------------------------
 * comp1 and comp2 solvers for time stepping
 *------------------------------------------------------------------------
 */
    env.compUniforms = function(_inUv ){
        this.pinUv       = { type : 's',     value   : _inUv         ,
        wrapS: 'repeat', wrapT: 'repeat'} ;
        this.ninUv      = { type : 's', value : _inUv,
        wrapS: 'repeat', wrapT: 'repeat'} ;
        this.Dx         = { type : 'f',     value   : env.Dx          } ;
        this.Dy         = { type : 'f',     value   : env.Dy          } ;
        this.a          = { type : 'f',     value   : env.a           } ;
        this.b          = { type : 'f',     value   : env.b           } ;
        this.p          = { type : 'f',     value   : env.p           } ;
        this.dx         = { type : 'f',     value   : env.dx          } ;
        this.dt         = { type : 'f',     value   : env.dt          } ;

    } ;

    env.compTargets = function(_outUv){
        this.outUv = { location : 0  , target :  _outUv     } ;
    } ;

    env.comp1 = new Abubu.Solver( {
        fragmentShader  : compShader.value,
        vertexShader    : vertShader.value,
        uniforms        : new env.compUniforms( env.fuv    ) ,
        renderTargets   : new env.compTargets(  env.suv    ) ,
    } ) ;

    env.comp2 = new Abubu.Solver( {
        fragmentShader  : compShader.value,
        vertexShader    : vertShader.value,
        uniforms        : new env.compUniforms( env.suv    ) ,
        renderTargets   : new env.compTargets(  env.fuv    ) ,
    } ) ;

/*------------------------------------------------------------------------
 * click solver
 *------------------------------------------------------------------------
 */
    env.click = new Abubu.Solver( {
        vertexShader    : vertShader.value ,
        fragmentShader  : clickShader.value ,
        uniforms        : {
            map             : { type: 't',  value : env.fuv           } ,
            setV : { type : 'b' , value : env.setV} ,
            setW : { type : 'b' , value : env.setW} ,
            v    : { type : 'f' , value : env.v } ,
            w    : { type : 'f' , value : env.w } ,
            clickPosition   : { type: 'v2', value : env.clickPosition  } ,
            clickRadius     : { type: 'f',  value : env.clickRadius    } ,
        } ,
        renderTargets   : {
            FragColor   : { location : 0,   target : env.suv      } ,
        } ,
        clear           : true ,
    } ) ;
    env.clickCopy = new Abubu.Copy(env.suv, env.fuv ) ;

/*------------------------------------------------------------------------
 * pace
 *------------------------------------------------------------------------
 */
    env.pace = new Abubu.Solver({
            fragmentShader  : paceShader.value,
            vertexShader    : vertShader.value,
            uniforms        : {
                inVcxf      : { type: 't', value : env.suv },
                } ,
            renderTargets: {
                outVcxf : {location : 0 , target : env.fuv }
                }
            } ) ;

/*------------------------------------------------------------------------
 * disp
 *------------------------------------------------------------------------
 */
    env.disp= new Abubu.Plot2D({
        target : env.suv ,
        channel : 'r' ,
        prevTarget : env.fuv ,
        colormap : env.colormap,
        canvas : canvas_1 ,
        minValue: env.minValue ,
        maxValue: env.maxValue ,
        tipt : false ,
        tiptThreshold : env.tiptThreshold ,
        probeVisible : false ,
        colorbar : true ,
        cblborder: 15 ,
        cbrborder: 15 ,
        unit : '',
    } );
    env.disp.showColorbar() ;
    env.disp.addMessage(  "u-variable",
                        0.05,   0.05, /* Coordinate of the
                                         message ( x,y in [0-1] )   */
                        {   font: "Bold 14pt Times",
                            style:"#000000",
                            align : "start"             }   ) ;
/*------------------------------------------------------------------------
 * initialize
 *------------------------------------------------------------------------
 */
    env.initialize = function(){
        env.time = 0 ;
        env.paceTime = 0 ;
        env.breaked = false ;
        env.init.render() ;
        env.disp.initialize() ;
        refreshDisplay() ;
    }

/*-------------------------------------------------------------------------
 * Render the programs
 *-------------------------------------------------------------------------
 */
   env.initialize() ;

/*------------------------------------------------------------------------
 * createGui
 *------------------------------------------------------------------------
 */
   createGui() ;

/*------------------------------------------------------------------------
 * clicker
 *------------------------------------------------------------------------
 */
    canvas_1.addEventListener("click",      onClick,        false   ) ;
    canvas_1.addEventListener('mousemove',
            function(e){
                if ( e.buttons >=1 ){
                    onClick(e) ;
                }
            } , false ) ;

/*------------------------------------------------------------------------
 * rendering the program ;
 *------------------------------------------------------------------------
 */
    env.render = function(){
        if (env.running){
            for(var i=0 ; i< env.frameRate/120 ; i++){
                env.comp1.render() ;
                env.comp2.render() ;
                env.time += 2.0*env.dt ;
                env.paceTime += 2.0*env.dt ;
                stats.update();
                stats.update() ;
                env.disp.updateTipt() ;

            }
            refreshDisplay();
        }
        requestAnimationFrame(env.render) ;
    }

/*------------------------------------------------------------------------
 * add environment to document
 *------------------------------------------------------------------------
 */
    document.env = env ;

/*------------------------------------------------------------------------
 * render the webgl program
 *------------------------------------------------------------------------
 */
    env.render();

}/*  End of loadWebGL  */

/*========================================================================
 * refreshDisplay
 *========================================================================
 */
function refreshDisplay(){
    env.disp.render() ;
}

/*========================================================================
 * onClick
 *========================================================================
 */
function onClick(e){
    console.log('h') ;
    env.clickPosition[0] =
        (e.clientX + document.documentElement.scrollLeft - env.canvas_1.offsetLeft) / env.canvas_1.width ;
    env.clickPosition[1] =  1.-(e.clientY + document.documentElement.scrollTop - env.canvas_1.offsetTop)/ env.canvas_1.height ;

    env.click.setUniform('clickPosition',env.clickPosition) ;

    if (    env.clickPosition[0]   >   1.0 ||
            env.clickPosition[0]   <   0.0 ||
            env.clickPosition[1]   >   1.0 ||
            env.clickPosition[1]   <   0.0 ){
        return ;
    }
    clickSolve() ;
    return ;
}

/*========================================================================
 * solve click event
 *========================================================================
 */
function clickSolve(){
    env.click.render() ;
    env.clickCopy.render() ;
    refreshDisplay() ;
}

/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * End of require()
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
loadWebGL() ;
} ) ;
