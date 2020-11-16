#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * compShader   :   OREGONATOR MODEL
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
uniform float       Du ;
uniform float       Dv ;

uniform float     f, q, epsilon   ;
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

    float dv2dt =  (texture(ninUv, cc+ii).r -2.*v +texture(ninUv,cc-ii).r)*cddx
        + ( texture(pinUv, cc+jj).r -2.*v + texture(pinUv, cc-jj).r)*cddy ;

    dw2dt *= Du ;
    dv2dt *= Dv ;

/*------------------------------------------------------------------------
 * Time integration for membrane potential
 *------------------------------------------------------------------------

 */
    dw2dt += (w - pow(w, 2.) - f*v*(w - q))/((w + q)*epsilon) ;

    dv2dt += w - v ;

    w += dw2dt*dt ;
    v += dv2dt*dt ;
/*------------------------------------------------------------------------
 * ouputing the shader
 *------------------------------------------------------------------------
 */

    outUv = vec4(w,v,0.0,0.0);

    return ;
}
