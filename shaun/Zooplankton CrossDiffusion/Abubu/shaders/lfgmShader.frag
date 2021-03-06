#version 300 es
/*========================================================================
 * lfgmShader   :  Fragmet Shader for Creating Plots
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Thu 03 Aug 2017 05:06:02 PM EDT
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *========================================================================
 */
#include precision.glsl

/*========================================================================
 * Interface Variables
 *========================================================================
 */
in      vec2        pixPos ;
uniform vec3        color ;
uniform float       visible ;
out     vec4        FragColor ;

/*=========================================================================
 * Main body
 *=========================================================================
 */
void main()
{
    FragColor = vec4(color,1.0);
}
