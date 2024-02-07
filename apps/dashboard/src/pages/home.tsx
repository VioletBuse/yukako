import { useUser } from '@/lib/hooks/data-hooks/auth.ts';
import { MainLayout } from '@/layouts/main.tsx';

export const HomePage: React.FC = () => {
    const [data, error, loading] = useUser();

    console.log({ data, error, loading });

    return (
        <>
            <MainLayout selectedTab='home'>
                <p>
                    Etiam eros habitant arcu mi viverra praesent? Tincidunt
                    vestibulum sollicitudin fames senectus sociis dis fermentum
                    quisque nam auctor montes. Non potenti ridiculus, elit
                    penatibus platea cras dictumst morbi gravida vulputate! Dui
                    ad, dolor etiam. Malesuada netus augue duis turpis penatibus
                    odio euismod. Ullamcorper, diam lacinia conubia. Mi
                    imperdiet dis mauris justo ullamcorper phasellus porttitor!
                    Fusce aliquet metus quam pulvinar cubilia adipiscing curae;?
                    Ultrices, nisi sed varius porta. Turpis habitant condimentum
                    porttitor, suspendisse neque curae; varius lectus dis.
                    Pulvinar nulla vulputate orci amet rhoncus erat sociis
                    aliquet vitae cras nisi per! Quisque porttitor etiam varius
                    bibendum imperdiet fusce vulputate erat. Eu imperdiet
                    vehicula in faucibus quis dapibus. Dis augue a tristique
                    nibh odio fames fringilla at vel neque torquent. Diam
                    tristique integer ut.
                </p>
                <p>
                    Velit, sapien gravida velit imperdiet turpis enim. Lectus
                    habitant, eros vitae amet vulputate luctus penatibus
                    eleifend volutpat odio varius. Cubilia neque fames velit,
                    eleifend phasellus per. Lorem donec augue quis et.
                    Vestibulum sem nullam magnis aenean cras purus congue!
                    Auctor mi hac venenatis aliquet habitasse aliquam. Aenean
                    parturient habitant duis a pretium convallis risus feugiat
                    vivamus montes? A primis senectus nec vitae tempor
                    condimentum mattis suscipit commodo. Cubilia netus praesent
                    nam netus posuere donec posuere ut! Dapibus nibh nec varius
                    eleifend lacinia sollicitudin vel tristique himenaeos morbi
                    ornare. Convallis aliquet sollicitudin urna aenean. Sem
                    porta torquent libero ornare maecenas ridiculus. Varius
                    montes nascetur arcu nostra. Taciti at mi est fusce iaculis
                    ultricies curabitur velit a enim montes hac. Sollicitudin
                    nam euismod iaculis nam eros praesent. Eu vitae,
                    condimentum.
                </p>
                <p>
                    Eros hendrerit gravida cursus quisque pharetra; convallis
                    turpis tortor. Elit quis ligula fermentum felis consectetur
                    himenaeos. Nibh magna rutrum sagittis enim. Malesuada orci
                    sapien nostra facilisis vulputate suspendisse aliquet
                    dapibus. Nullam mattis nibh, laoreet lacus! Etiam, montes
                    orci nisl curae; suspendisse cum. Integer sapien luctus
                    tempus vivamus aliquet. Laoreet elementum parturient arcu
                    nulla lectus condimentum nullam primis vitae ac conubia
                    tempus. Tincidunt maecenas gravida diam tellus odio?
                </p>
                <p>
                    Metus consectetur curae; ut. Sociosqu non aliquet lobortis
                    urna, sem mauris. Mattis nulla convallis sed erat vestibulum
                    netus tortor cras molestie adipiscing ridiculus. Primis
                    maecenas pulvinar metus ridiculus ac vehicula sit nullam
                    mollis amet posuere. Sodales mollis eget nisl conubia
                    vehicula neque est mollis torquent inceptos eu tincidunt.
                    Pellentesque fusce turpis, phasellus pulvinar sit placerat.
                    Nam aliquam vulputate dictum eleifend id metus. Cum euismod
                    faucibus, facilisi dolor. Per imperdiet habitasse porttitor
                    odio pulvinar id aliquam euismod dapibus eu nisl. Velit,
                    tortor ullamcorper aptent taciti imperdiet vestibulum. Magna
                    mauris dui venenatis venenatis rhoncus inceptos ad nascetur
                    nec. Vel velit euismod sem. Potenti penatibus lorem id
                    aptent habitasse per sodales, congue neque. Malesuada augue
                    phasellus euismod ante? Dui fringilla justo semper amet
                    ligula suscipit velit in in. Leo fermentum vivamus proin
                    natoque, per bibendum! Morbi vel, netus!
                </p>
                <p>
                    Metus penatibus eleifend fames. Praesent augue ultrices
                    vestibulum himenaeos aliquam amet dis volutpat luctus
                    pharetra id. Accumsan aenean nisi vestibulum elementum
                    ultrices accumsan. Mi sociis bibendum vehicula vehicula
                    tortor elit. Neque fermentum montes, pellentesque ante
                    pellentesque himenaeos. Malesuada facilisi hac nec nulla
                    magnis vel. Et aptent risus et porttitor platea tortor
                    phasellus purus duis lectus cras. Eleifend, ipsum integer
                    facilisi a morbi? Pharetra lacus odio dictum hendrerit
                    interdum consectetur, ante vivamus. Feugiat conubia lorem
                    iaculis, fusce fames imperdiet volutpat ante cras ligula
                    ligula.
                </p>
            </MainLayout>
        </>
    );
};
