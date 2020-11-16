#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * compShader   :   BAR MODEL
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN, SHAUN EISNER
 * DATE         :   Wed 06 Dec 2017 04:25:26 PM EST
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
precision highp float;
precision highp int ;

/*------------------------------------------------------------------------
 * Interface variables :
 * varyings change to "in" types in fragment shaders
 * and "out" in vertexShaders
 *------------------------------------------------------------------------
 */
in vec2 pixPos ;

uniform sampler2D   ninUv ;
uniform sampler2D   pinUv ;

uniform float       dx ;
uniform float       dt ;

uniform float     a, b, epsilon, omega   ;
#define vSampler  pinUv

/*------------------------------------------------------------------------
 * It turns out for my current graphics card the maximum number of
 * drawBuffers is limited to 8
 *------------------------------------------------------------------------
 */
layout (location = 0 )  out vec4 outUv ;

/*========================================================================
 * Main body of the shader
 *========================================================================
 */
void main() {
    vec2    cc = pixPos ;
    vec2    size    = vec2(textureSize( vSampler, 0 ) );
    float   cddx    = 1./dx;
    float   cddy    = 1./dx ;

    cddx *= cddx ;
    cddy *= cddy ;

/*------------------------------------------------------------------------
 * reading from textures
 *------------------------------------------------------------------------
 */
    vec4    C = texture( pinUv , pixPos ) ;
    float   w = C.r ;
    float   v = C.g ;

/*-------------------------------------------------------------------------
 * Laplacian
 *-------------------------------------------------------------------------
 */
    vec2 ii = vec2(1.0,0.0)/size ;
    vec2 jj = vec2(0.0,1.0)/size ;

/*-------------------------------------------------------------------------
  * v = v, w = u
  *-------------------------------------------------------------------------
  */

    float dw2dt =  (texture(ninUv, cc+ii).r -2.*w +texture(ninUv,cc-ii).r)*cddx
        + ( texture(pinUv, cc+jj).r -2.*w + texture(pinUv, cc-jj).r)*cddy ;

    float dv2dt = -v ;

    dw2dt += omega*(((w - (texture(ninUv, cc - ii)).r)*cddx) + ((w - (texture(ninUv, cc - jj)).r)*cddy)) ;
    dv2dt += omega*(((v - (texture(ninUv, cc - ii)).g)*cddx) + ((v - (texture(ninUv, cc - jj)).g)*cddy)) ;

/*------------------------------------------------------------------------
 * Time integration for membrane potential
 *------------------------------------------------------------------------
 */
    dw2dt  += (-1./epsilon)*w*(w - 1.)*(w - (b + v)/a);

    if(w >= 0. && w < (1./3.)) {
      dv2dt += 0. ;
    }
    else if((w >= (1./3.)) && (w <= 1.)){
      dv2dt += 1. - 6.75*w*pow((w - 1.), 2.);
    }
    else if (w > 1.){
      dv2dt += 1. ;
    }

    v += dv2dt*dt ;
    w += dw2dt*dt ;

/*------------------------------------------------------------------------
 * ouputing the shader
 *------------------------------------------------------------------------
 */

    outUv = vec4(w,v,0.0,0.0);

    return ;
}
