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

uniform float     D, a, epsilon, b, c, d, delta, omega, phidot   ;
#define vSampler  pinUv

/*------------------------------------------------------------------------
 * It turns out for my current graphics card the maximum number of
 * drawBuffers is limited to 8
 *------------------------------------------------------------------------
 */
layout (location = 0 )  out vec4 outUv ;
layout (location = 2 )  out vec4 outDeriv ;

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
    float   v = C.r ;
    float   w = C.g ;
    float   omega_p = max(omega, 0.0) ;
    float   omega_n = min(omega, 0.0) ;

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

    float dv2dt =  (texture(ninUv, cc+ii).r -2.*v +texture(ninUv,cc-ii).r)*cddx
        + ( texture(pinUv, cc+jj).r -2.*v + texture(pinUv, cc-jj).r)*cddy ;

    dv2dt *= D ;

    float dvdx = (((v - (texture(ninUv, cc - ii)).r)*cddx)) ;

    float dvdy = ((v - (texture(ninUv, cc - jj)).r)*cddy)  ;

    float dwdx = (((w - (texture(ninUv, cc - ii)).g)*cddx)) ;

    float dwdy = ((w - (texture(ninUv, cc - jj)).g)*cddy) ;

    dv2dt += omega_n*dvdx + omega_p*(((texture(ninUv, cc + ii)).r - v)*cddx)  + omega_n*dvdy + omega_p*(((texture(ninUv, cc + jj)).r)*cddy - v);
    float dw2dt = omega_n*dwdx + omega_p*(((texture(ninUv, cc + ii)).g - w)*cddx) + omega_n*dwdy + omega_p*(((texture(ninUv, cc + jj)).g)*cddy - w) ;
/*------------------------------------------------------------------------
 * Time integration for membrane potential
 *------------------------------------------------------------------------
 */
    dv2dt  += v*(a - v)*(v - c) - w ;

    dw2dt += epsilon*(b*v - d*w - delta) ;

    v += dv2dt*dt ;
    w += dw2dt*dt ;

/*------------------------------------------------------------------------
 * ouputing the shader
 *------------------------------------------------------------------------
 */

    outUv = vec4(v,w,0.0,0.0);

    outDeriv = vec4(dvdx, dvdy, dwdx, dwdy);

    return ;
}
