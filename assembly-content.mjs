// Adapted from the user-supplied laptop-scroll.html; paths and assembly offsets are preserved.
export const assembly = `<svg class="assembly-product" viewBox="0 -45 1254 1360" role="img" aria-label="Laptop components separating and assembling"><defs><image id="assembly-source" width="1254" height="1254" href="assets/images/laptop/rog-assembly-cutout.png"/>
<clipPath id="assembly-lid"><polygon points="226,266 428,17 998,37 1001,59 862,331 847,355 815,348 811,331 265,286 254,301 235,292"/></clipPath>
<clipPath id="assembly-screen"><polygon points="267,365 374,284 813,325 881,283 1014,290 1029,300 909,452 883,470 869,457 282,400 268,388"/></clipPath>
<clipPath id="assembly-keyboard"><polygon points="187,485 391,405 951,464 966,453 984,470 1067,482 1066,499 875,601 203,511 189,500"/></clipPath>
<clipPath id="assembly-cooling"><polygon points="203,568 322,526 448,538 543,567 791,596 923,592 1001,607 1047,628 1046,705 941,748 749,727 626,687 488,679 405,654 304,657 207,614"/></clipPath>
<clipPath id="assembly-board"><polygon points="232,768 365,681 491,667 635,704 808,737 1025,775 1026,814 914,908 598,852 237,790"/></clipPath>
<clipPath id="assembly-battery"><polygon points="254,845 365,806 911,928 918,959 868,1020 255,882"/></clipPath>
<clipPath id="assembly-base"><polygon points="151,939 268,886 352,907 861,1017 925,939 1012,952 1070,978 1070,1004 856,1178 805,1183 151,982"/></clipPath>
<clipPath id="assembly-left"><polygon points="74,736 172,689 175,722 87,766 74,759"/></clipPath>
<clipPath id="assembly-right"><polygon points="985,869 1118,768 1126,790 1001,902 985,895"/></clipPath>
<clipPath id="assembly-inner"><polygon points="164,762 308,675 323,686 321,704 176,789 164,780"/></clipPath></defs>
<g id="assembly-parts"><g class="assembly-layer" data-offset-y="-280" data-offset-x="0" data-layer="chassis"><use href="#assembly-source" clip-path="url(#assembly-base)"/></g>
<g class="assembly-layer" data-offset-y="-215" data-offset-x="0" data-layer="battery"><use href="#assembly-source" clip-path="url(#assembly-battery)"/></g>
<g class="assembly-layer" data-offset-y="-95" data-offset-x="0" data-layer="motherboard"><use href="#assembly-source" clip-path="url(#assembly-board)"/></g>
<g class="assembly-layer" data-offset-y="-90" data-offset-x="100" data-layer="motherboard"><use href="#assembly-source" clip-path="url(#assembly-left)"/></g>
<g class="assembly-layer" data-offset-y="-110" data-offset-x="-90" data-layer="motherboard"><use href="#assembly-source" clip-path="url(#assembly-right)"/></g>
<g class="assembly-layer" data-offset-y="-90" data-offset-x="50" data-layer="motherboard"><use href="#assembly-source" clip-path="url(#assembly-inner)"/></g>
<g class="assembly-layer" data-offset-y="70" data-offset-x="0" data-layer="cooling"><use href="#assembly-source" clip-path="url(#assembly-cooling)"/></g>
<g class="assembly-layer" data-offset-y="210" data-offset-x="0" data-layer="keyboard"><use href="#assembly-source" clip-path="url(#assembly-keyboard)"/></g>
<g class="assembly-layer" data-offset-y="330" data-offset-x="0" data-layer="display"><use href="#assembly-source" clip-path="url(#assembly-screen)"/></g>
<g class="assembly-layer" data-offset-y="445" data-offset-x="0" data-layer="display"><use href="#assembly-source" clip-path="url(#assembly-lid)"/></g>
</g></svg>`;
