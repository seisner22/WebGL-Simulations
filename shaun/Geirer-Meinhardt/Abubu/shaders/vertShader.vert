#version 300 es
/*========================================================================
 * vertShader   :  Default Vertex Shader
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Thu 03 Aug 2017 05:07:21 PM EDT
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *========================================================================
 */
#include precision.glsl

/*========================================================================
 * Interface variables
 *========================================================================
 */
in  vec3 position;

out vec2 pixPos ;
out vec3 pixCrd ;

/*=========================================================================
 * Main body of the vertex shader
 *=========================================================================
 */
void main()
{   
    pixPos = position.xy ;
    pixCrd = position.xyz ;
    gl_Position = vec4(position.x*2.-1., position.y*2.-1.,0.,1.0);
}

