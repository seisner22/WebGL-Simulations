#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * compShader   :   BRUSSELATOR MODEL
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
uniform float       D11, D12, D21, D22 ;

uniform float     r, k, beta, h, alpha, m, delta  ;
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
    float   v = C.r ;
    float   w = C.g ;

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

    float diffw =  (texture(ninUv, cc+ii).r -2.*w +texture(ninUv,cc-ii).r)*cddx
        + ( texture(pinUv, cc+jj).r -2.*w + texture(pinUv, cc-jj).r)*cddy ;

    float diffv =  (texture(ninUv, cc+ii).r -2.*v +texture(ninUv,cc-ii).r)*cddx
        + ( texture(pinUv, cc+jj).r -2.*v + texture(pinUv, cc-jj).r)*cddy ;

    float dw2dt = D11*diffw + D12*diffv ;
    float dv2dt = D21*diffw + D22*diffv ;

/*------------------------------------------------------------------------
 * Time integration for membrane potential
 *------------------------------------------------------------------------

 */
    dw2dt += r*w*(1. - w/k) - (beta*v*w)*sqrt(2.)*(h + w)/(sqrt(pow((h + w), 4.) + pow((pow((h + w), 2.) + pow(1., 2.)), 2.))) ;

    dv2dt += (alpha*w*v)*sqrt(2.)*(h + w)/(sqrt(pow((h + w), 4.) + pow((pow((h + w), 2.) + pow(1., 2.)), 2.))) - m*v - (delta*w*v)*sqrt(2.)*(h + w)/
    (sqrt(pow((h + w), 4.) + pow((pow((h + w), 2.) + pow(1., 2.)), 2.))) ;

    w += dw2dt*dt ;
    v += dv2dt*dt ;
/*------------------------------------------------------------------------
 * ouputing the shader
 *------------------------------------------------------------------------
 */

    outUv = vec4(v,w,0.0,0.0);

    return ;
}
